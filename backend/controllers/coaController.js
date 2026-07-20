const db = require('../config/db');

// GET /api/coa
exports.getAllCoa = async (req, res) => {
    try {
        const query = 'SELECT * FROM chart_of_accounts ORDER BY id ASC';
        const [rows] = await db.query(query);
        res.status(200).json({ status: 'success', data: rows });
    } catch (error) {
        console.error('Error fetching COA:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch Chart of Accounts' });
    }
};

// POST /api/coa
exports.createCoa = async (req, res) => {
    const { account_name, account_type } = req.body;
    try {
        // Auto-generate account_code based on timestamp to ensure uniqueness
        const account_code = `COA-${Date.now()}`;
        
        const query = 'INSERT INTO chart_of_accounts (account_code, account_name, account_type) VALUES (?, ?, ?)';
        const [result] = await db.query(query, [account_code, account_name, account_type]);
        
        res.status(201).json({ status: 'success', data: { id: result.insertId, account_code, account_name, account_type } });
    } catch (error) {
        console.error('Error creating COA:', error);
        res.status(500).json({ status: 'error', message: 'Failed to create Chart of Account' });
    }
};

// PUT /api/coa/:id
exports.updateCoa = async (req, res) => {
    const { id } = req.params;
    const { account_name, account_type } = req.body;
    try {
        const query = 'UPDATE chart_of_accounts SET account_name = ?, account_type = ? WHERE id = ?';
        await db.query(query, [account_name, account_type, id]);
        
        res.status(200).json({ status: 'success', message: 'Chart of Account updated successfully' });
    } catch (error) {
        console.error('Error updating COA:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update Chart of Account' });
    }
};

// DELETE /api/coa/:id
exports.deleteCoa = async (req, res) => {
    const { id } = req.params;
    try {
        // Option 1: Direct delete. Note: this might fail if there are foreign key constraints from cash_book
        const query = 'DELETE FROM chart_of_accounts WHERE id = ?';
        await db.query(query, [id]);
        
        res.status(200).json({ status: 'success', message: 'Chart of Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting COA:', error);
        // If it's a foreign key error, return a friendlier message
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ status: 'error', message: 'Cannot delete: Category is already used in transactions' });
        }
        res.status(500).json({ status: 'error', message: 'Failed to delete Chart of Account' });
    }
};
