const db = require('../config/db');

exports.getAllIncomes = async (req, res) => {
    try {
        const query = `
            SELECT cb.*, coa.account_name, coa.account_type, coa.account_code 
            FROM cash_book cb
            JOIN chart_of_accounts coa ON cb.account_id = coa.id
            WHERE cb.cash_in > 0 
              AND (cb.cash_out IS NULL OR cb.cash_out = 0)
              AND (coa.account_code NOT IN ('4-1000', '4-1001', '4-1002', '4-2000') 
                   AND cb.description NOT LIKE 'Pencairan Dana%' 
                   AND cb.description NOT LIKE 'Penjualan Direct%')
            ORDER BY cb.transaction_date DESC, cb.created_at DESC
        `;
        const [rows] = await db.query(query);
        res.status(200).json({ status: 'success', data: rows });
    } catch (error) {
        console.error('Error fetching incomes:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch incomes' });
    }
};

exports.createIncome = async (req, res) => {
    const { transaction_date, account_id, description, cash_in } = req.body;
    try {
        const query = `
            INSERT INTO cash_book (transaction_date, account_id, description, cash_in, cash_out)
            VALUES (?, ?, ?, ?, 0)
        `;
        const [result] = await db.query(query, [transaction_date, account_id, description, cash_in]);
        res.status(201).json({ status: 'success', data: { id: result.insertId } });
    } catch (error) {
        console.error('Error creating income:', error);
        res.status(500).json({ status: 'error', message: 'Failed to create income' });
    }
};

exports.updateIncome = async (req, res) => {
    const { id } = req.params;
    const { transaction_date, account_id, description, cash_in } = req.body;
    try {
        const query = `
            UPDATE cash_book 
            SET transaction_date = ?, account_id = ?, description = ?, cash_in = ?
            WHERE id = ?
        `;
        await db.query(query, [transaction_date, account_id, description, cash_in, id]);
        res.status(200).json({ status: 'success', message: 'Income updated successfully' });
    } catch (error) {
        console.error('Error updating income:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update income' });
    }
};

exports.deleteIncome = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM cash_book WHERE id = ?';
        await db.query(query, [id]);
        res.status(200).json({ status: 'success', message: 'Income deleted successfully' });
    } catch (error) {
        console.error('Error deleting income:', error);
        res.status(500).json({ status: 'error', message: 'Failed to delete income' });
    }
};
