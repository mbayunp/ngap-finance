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

        // 1. Ambil commission_rate dan settlement_lag_days dari tabel channels
        const [channelRows] = await connection.query(
            'SELECT commission_rate, settlement_lag_days FROM channels WHERE id = ?', 
            [channel_id]
        );
        
        if (channelRows.length === 0) {
            throw new Error('Channel not found');
        }
        
        const { commission_rate, settlement_lag_days } = channelRows[0];
        
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

        // 7. Lakukan INSERT ke daily_sales
        const insertSalesQuery = `
            INSERT INTO daily_sales 
            (transaction_date, channel_id, total_qty, gross_revenue, total_hpp, commission_amount, net_settlement, settlement_date, status_pencairan) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
        `;
        const [saleResult] = await connection.query(insertSalesQuery, [
            transaction_date,
            channel_id,
            total_qty,
            gross_revenue,
            total_hpp,
            commission_amount,
            net_settlement,
            settlement_date
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
