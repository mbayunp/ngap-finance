const db = require('../config/db');

// Helper Tanggal Format YYYY-MM-DD Lokal
const getLocalDateString = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// GET /api/sales
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

// POST /api/sales
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

        const [channelRows] = await connection.query(
            'SELECT commission_rate, settlement_lag_days, type FROM channels WHERE id = ?', 
            [channel_id]
        );
        
        if (channelRows.length === 0) {
            throw new Error('Channel not found');
        }
        
        const { commission_rate, settlement_lag_days, type: channelType } = channelRows[0];
        
        let gross_revenue = 0;
        let total_hpp = 0;
        let total_qty = 0;
        const processedItems = [];

        for (const item of items) {
            const qty = parseInt(item.qty);
            if (!qty || qty <= 0) continue;

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

        const commission_amount = gross_revenue * parseFloat(commission_rate);
        
        const net_settlement = gross_revenue - commission_amount;

        const trxDate = new Date(transaction_date);
        trxDate.setDate(trxDate.getDate() + parseInt(settlement_lag_days));
        const settlement_date = getLocalDateString(trxDate);

        const isDirect = (channelType === 'Direct');
        const status_pencairan = isDirect ? 'PAID' : 'PENDING';

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

        const itemValues = processedItems.map(item => [dailySaleId, ...item]);
        const insertItemsQuery = `
            INSERT INTO daily_sale_items 
            (daily_sale_id, product_id, qty, price, hpp, subtotal_price, subtotal_hpp) 
            VALUES ?
        `;
        
        await connection.query(insertItemsQuery, [itemValues]);

        if (isDirect) {
            const [coaRows] = await connection.query(
                "SELECT id FROM chart_of_accounts WHERE account_code = '4-1001'"
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

// DELETE /api/sales/:id
exports.deleteSale = async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Hapus catatan kas terkait di cash_book agar tidak menjadi data yatim/phantom
        await connection.query(
            "DELETE FROM cash_book WHERE description LIKE ?",
            [`%Sale ID #${id}`]
        );

        // 2. Hapus transaksi utama daily_sales (rincian items terhapus via CASCADE)
        const query = 'DELETE FROM daily_sales WHERE id = ?';
        const [result] = await connection.query(query, [id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Data not found'
            });
        }

        await connection.commit();

        res.status(200).json({
            status: 'success',
            message: 'Data successfully deleted'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting sale:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete sale transaction'
        });
    } finally {
        connection.release();
    }
};

// PUT /api/sales/:id/settle
exports.settleSale = async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [salesRows] = await connection.query(
            'SELECT * FROM daily_sales WHERE id = ? FOR UPDATE',
            [id]
        );

        if (salesRows.length === 0) {
            throw new Error('Transaction not found');
        }

        const sale = salesRows[0];

        if (sale.status_pencairan === 'PAID') {
            throw new Error('Transaction is already settled');
        }

        const net_settlement = sale.net_settlement;
        const today = getLocalDateString();

        await connection.query(
            "UPDATE daily_sales SET status_pencairan = 'PAID', settlement_date = ? WHERE id = ?",
            [today, id]
        );

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
                today, 
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

// PUT /api/sales/bulk-settle
exports.bulkSettleSales = async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid payload: ids array is required'
        });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const today = getLocalDateString();

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

        let settledCount = 0;

        for (const id of ids) {
            const [salesRows] = await connection.query(
                'SELECT * FROM daily_sales WHERE id = ? FOR UPDATE',
                [id]
            );

            if (salesRows.length === 0) continue;
            const sale = salesRows[0];

            if (sale.status_pencairan === 'PENDING') {
                await connection.query(
                    "UPDATE daily_sales SET status_pencairan = 'PAID', settlement_date = ? WHERE id = ?",
                    [today, id]
                );

                if (accountId) {
                    await connection.query(`
                        INSERT INTO cash_book (transaction_date, account_id, description, cash_in, cash_out)
                        VALUES (?, ?, ?, ?, ?)
                    `, [
                        today,
                        accountId,
                        `Pencairan Dana (Settlement Masal) - Sale ID #${id}`,
                        sale.net_settlement,
                        0
                    ]);
                }
                settledCount++;
            }
        }

        await connection.commit();

        res.status(200).json({
            status: 'success',
            message: `${settledCount} transactions settled successfully`,
            settledCount
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error bulk settling sales:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to process bulk settlement'
        });
    } finally {
        connection.release();
    }
};

// POST /api/sales/bulk-delete
exports.bulkDeleteSales = async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid payload: ids array is required'
        });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Hapus seluruh catatan kas terkait di cash_book untuk ID yang akan dihapus massal
        for (const id of ids) {
            await connection.query(
                "DELETE FROM cash_book WHERE description LIKE ?",
                [`%Sale ID #${id}`]
            );
        }

        // 2. Hapus data utama di daily_sales
        const query = 'DELETE FROM daily_sales WHERE id IN (?)';
        const [result] = await connection.query(query, [ids]);

        await connection.commit();

        res.status(200).json({
            status: 'success',
            message: `${result.affectedRows} transactions deleted successfully`,
            deletedCount: result.affectedRows
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error bulk deleting sales:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to bulk delete sales transactions'
        });
    } finally {
        connection.release();
    }
};
