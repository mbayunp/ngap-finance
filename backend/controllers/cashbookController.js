const db = require('../config/db');

// ==========================================
// GET /api/cashbook
// Mengambil riwayat transaksi dari tabel cash_book dengan join chart_of_accounts
// ==========================================
exports.getCashbook = async (req, res) => {
    try {
        const query = `
            SELECT cb.*, coa.account_name, coa.account_type
            FROM cash_book cb
            LEFT JOIN chart_of_accounts coa ON cb.account_id = coa.id
            ORDER BY cb.transaction_date DESC, cb.id DESC
        `;
        const [rows] = await db.query(query);

        res.status(200).json({
            status: 'success',
            data: rows
        });
    } catch (error) {
        console.error('Error fetching cashbook data:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while fetching cashbook'
        });
    }
};

// ==========================================
// POST /api/cashbook
// Membuat input transaksi cash_book baru
// ==========================================
exports.createCashbookEntry = async (req, res) => {
    const { transaction_date, account_id, description, cash_in, cash_out } = req.body;

    // Validasi sederhana
    if (!transaction_date || !account_id) {
        return res.status(400).json({
            status: 'error',
            message: 'transaction_date and account_id are required'
        });
    }

    try {
        const query = `
            INSERT INTO cash_book (transaction_date, account_id, description, cash_in, cash_out)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [
            transaction_date,
            account_id,
            description || '',
            cash_in || 0,
            cash_out || 0
        ];

        const [result] = await db.query(query, values);

        res.status(201).json({
            status: 'success',
            data: {
                id: result.insertId,
                transaction_date,
                account_id,
                description,
                cash_in,
                cash_out
            }
        });
    } catch (error) {
        console.error('Error creating cashbook entry:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create cashbook entry'
        });
    }
};

// ==========================================
// PUT /api/cashbook/:id
// Memperbarui transaksi cash_book berdasarkan ID
// ==========================================
exports.updateCashbookEntry = async (req, res) => {
    const { id } = req.params;
    const { transaction_date, account_id, description, cash_in, cash_out } = req.body;

    if (!transaction_date || !account_id) {
        return res.status(400).json({
            status: 'error',
            message: 'transaction_date and account_id are required'
        });
    }

    try {
        const query = `
            UPDATE cash_book 
            SET transaction_date = ?, account_id = ?, description = ?, cash_in = ?, cash_out = ?
            WHERE id = ?
        `;
        const values = [
            transaction_date,
            account_id,
            description || '',
            cash_in || 0,
            cash_out || 0,
            id
        ];

        const [result] = await db.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Data not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Data successfully updated'
        });
    } catch (error) {
        console.error('Error updating cashbook entry:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update cashbook entry'
        });
    }
};

// ==========================================
// DELETE /api/cashbook/:id
// Menghapus transaksi cash_book berdasarkan ID
// ==========================================
exports.deleteCashbookEntry = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM cash_book WHERE id = ?';
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
        console.error('Error deleting cashbook entry:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete cashbook entry'
        });
    }
};
