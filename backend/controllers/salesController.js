const db = require('../config/db');

// ==========================================
// GET /api/sales
// Mengambil daftar semua penjualan dari daily_sales
// ==========================================
exports.getSales = async (req, res) => {
    try {
        const query = `
            SELECT ds.*, c.name as channel_name 
            FROM daily_sales ds 
            JOIN channels c ON ds.channel_id = c.id 
            ORDER BY ds.transaction_date DESC, ds.id DESC
        `;
        const [rows] = await db.query(query);
        
        res.status(200).json({
            status: 'success',
            data: rows
        });
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while fetching sales'
        });
    }
};

// ==========================================
// POST /api/sales
// Membuat transaksi penjualan harian
// ==========================================
exports.createSale = async (req, res) => {
    const { transaction_date, channel_id, items } = req.body;
    
    if (!transaction_date || !channel_id || !items || items.length === 0) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid payload'
        });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Ambil commission_rate, settlement_lag_days, dan type dari tabel channels
        const [channelRows] = await connection.query(
            'SELECT commission_rate, settlement_lag_days, type FROM channels WHERE id = ?', 
            [channel_id]
        );
        
        if (channelRows.length === 0) {
            throw new Error('Channel not found');
        }
        
        const { commission_rate, settlement_lag_days, type: channelType } = channelRows[0];
        
        // 2 & 3. Hitung total secara dinamis dengan melooping items
        let gross_revenue = 0;
        let total_hpp = 0;
        let total_qty = 0;
        const processedItems = [];

        for (const item of items) {
            // Abaikan jika qty 0 atau tidak valid
            const qty = parseInt(item.qty);
            if (!qty || qty <= 0) continue;

            // Query ke tabel products untuk mendapatkan price dan default_hpp
            const [productRows] = await connection.query(
                'SELECT price, default_hpp FROM products WHERE id = ?',
                [item.product_id]
            );
            
            if (productRows.length === 0) {
                throw new Error(`Product ID ${item.product_id} not found`);
            }
            
            const { price, default_hpp } = productRows[0];
            
            const subtotal_price = parseFloat(price) * qty;
            const subtotal_hpp = parseFloat(default_hpp) * qty;
            
            gross_revenue += subtotal_price;
            total_hpp += subtotal_hpp;
            total_qty += qty;
            
            // Siapkan data untuk bulk insert
            processedItems.push([
                item.product_id,
                qty,
                price,
                default_hpp,
                subtotal_price,
                subtotal_hpp
            ]);
        }

        if (processedItems.length === 0) {
            throw new Error('No valid items to process');
        }

        // 4. Kalkulasi commission_amount
        const commission_amount = gross_revenue * parseFloat(commission_rate);
        
        // 5. Kalkulasi net_settlement
        const net_settlement = gross_revenue - commission_amount;

        // 6. Hitung settlement_date (menggunakan manipulasi Date JS)
        const trxDate = new Date(transaction_date);
        trxDate.setDate(trxDate.getDate() + parseInt(settlement_lag_days));
        const settlement_date = trxDate.toISOString().split('T')[0];

        // Tentukan status pencairan berdasarkan tipe channel
        const isDirect = (channelType === 'Direct');
        const status_pencairan = isDirect ? 'PAID' : 'PENDING';

        // 7. Lakukan INSERT ke daily_sales
        const insertSalesQuery = `
            INSERT INTO daily_sales 
            (transaction_date, channel_id, total_qty, gross_revenue, total_hpp, commission_amount, net_settlement, settlement_date, status_pencairan) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [saleResult] = await connection.query(insertSalesQuery, [
            transaction_date,
            channel_id,
            total_qty,
            gross_revenue,
            total_hpp,
            commission_amount,
            net_settlement,
            settlement_date,
            status_pencairan
        ]);
        
        const dailySaleId = saleResult.insertId;

        // 8. Lakukan bulk INSERT ke daily_sale_items
        const itemValues = processedItems.map(item => [dailySaleId, ...item]);
        const insertItemsQuery = `
            INSERT INTO daily_sale_items 
            (daily_sale_id, product_id, qty, price, hpp, subtotal_price, subtotal_hpp) 
            VALUES ?
        `;
        
        await connection.query(insertItemsQuery, [itemValues]);

        // Jika channel bertipe Direct, otomatis masukkan ke cash_book
        if (isDirect) {
            const [coaRows] = await connection.query(
                "SELECT id FROM chart_of_accounts WHERE account_code = '4-1001'"
            );

            // Jika akun ditemukan, gunakan id tersebut, jika tidak, bisa fallback atau lempar error
            // Asumsi akun 4-1001 pasti ada atau fallback ke akun pendapatan default 4-1000
            let accountId = coaRows.length > 0 ? coaRows[0].id : null;
            
            if (!accountId) {
                const [fallbackRows] = await connection.query(
                    "SELECT id FROM chart_of_accounts WHERE account_code = '4-1000'"
                );
                if (fallbackRows.length > 0) accountId = fallbackRows[0].id;
            }

            if (accountId) {
                await connection.query(`
                    INSERT INTO cash_book (transaction_date, account_id, description, cash_in, cash_out)
                    VALUES (?, ?, ?, ?, ?)
                `, [
                    transaction_date,
                    accountId,
                    `Penjualan Direct - Sale ID #${dailySaleId}`,
                    net_settlement,
                    0
                ]);
            } else {
                console.warn('Account for Pendapatan Penjualan Direct not found. Skipped cash_book insertion.');
            }
        }

        // 9. Commit
        await connection.commit();

        res.status(201).json({
            status: 'success',
            message: 'Sale transaction created successfully',
            data: { 
                id: dailySaleId,
                gross_revenue,
                net_settlement
            }
        });
    } catch (error) {
        // Rollback jika terjadi error
        await connection.rollback();
        console.error('Error creating sale transaction:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to create sale transaction'
        });
    } finally {
        connection.release();
    }
};

// ==========================================
// DELETE /api/sales/:id
// Menghapus transaksi penjualan harian (header) beserta itemnya (via ON DELETE CASCADE)
// ==========================================
exports.deleteSale = async (req, res) => {
    const { id } = req.params;

    try {
        // Berdasarkan DDL, tabel daily_sale_items memiliki constraint ON DELETE CASCADE 
        // ke tabel daily_sales. Jadi, kita cukup menghapus baris di daily_sales 
        // dan database akan secara otomatis menghapus item terkait.
        const query = 'DELETE FROM daily_sales WHERE id = ?';
        const [result] = await db.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Data not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Data successfully deleted'
        });
    } catch (error) {
        console.error('Error deleting sale:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete sale transaction'
        });
    }
};

// ==========================================
// PUT /api/sales/:id/settle
// Pencairan dana untuk transaksi (khusus tipe Platform)
// ==========================================
exports.settleSale = async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Cek transaksi eksisting
        const [salesRows] = await connection.query(
            'SELECT * FROM daily_sales WHERE id = ? FOR UPDATE',
            [id]
        );

        if (salesRows.length === 0) {
            throw new Error('Transaction not found');
        }

        const sale = salesRows[0];

        // Cegah pencairan ganda
        if (sale.status_pencairan === 'PAID' || sale.status_pencairan === 'SETTLED') {
            throw new Error('Transaction is already settled');
        }

        const net_settlement = sale.net_settlement;
        
        // Buat string format YYYY-MM-DD untuk current date (sebagai fallback kalau DB function tdk bisa)
        const today = new Date().toISOString().split('T')[0];

        // 2. Update status dan settlement_date di daily_sales
        await connection.query(
            "UPDATE daily_sales SET status_pencairan = 'PAID', settlement_date = ? WHERE id = ?",
            [today, id]
        );

        // 3. Masukkan ke tabel cash_book
        // Cari id dari chart_of_accounts di mana account_code = '4-1002'
        const [coaRows] = await connection.query(
            "SELECT id FROM chart_of_accounts WHERE account_code = '4-1002'"
        );

        let accountId = coaRows.length > 0 ? coaRows[0].id : null;
        if (!accountId) {
            const [fallbackRows] = await connection.query(
                "SELECT id FROM chart_of_accounts WHERE account_code = '4-1000'"
            );
            if (fallbackRows.length > 0) accountId = fallbackRows[0].id;
        }

        if (accountId) {
            await connection.query(`
                INSERT INTO cash_book (transaction_date, account_id, description, cash_in, cash_out)
                VALUES (?, ?, ?, ?, ?)
            `, [
                today, // Menggunakan tanggal pencairan sebagai tanggal transaksi kas
                accountId,
                `Pencairan Dana (Settlement) - Sale ID #${id}`,
                net_settlement,
                0
            ]);
        } else {
            console.warn('Account for Pendapatan Penjualan Platform not found. Skipped cash_book insertion.');
        }

        await connection.commit();

        res.status(200).json({
            status: 'success',
            message: 'Settlement processed successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error settling sale:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to process settlement'
        });
    } finally {
        connection.release();
    }
};
