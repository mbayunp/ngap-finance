const db = require('../config/db');

exports.getAllChannels = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM channels ORDER BY id ASC');
        res.status(200).json({ status: 'success', data: rows });
    } catch (error) {
        console.error('Error fetching channels:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

exports.createChannel = async (req, res) => {
    const { name, commission_rate, settlement_lag_days } = req.body;
    if (!name || commission_rate === undefined || settlement_lag_days === undefined) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO channels (name, commission_rate, settlement_lag_days) VALUES (?, ?, ?)',
            [name, commission_rate, settlement_lag_days]
        );
        res.status(201).json({
            status: 'success',
            data: { id: result.insertId, name, commission_rate, settlement_lag_days }
        });
    } catch (error) {
        console.error('Error creating channel:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

exports.updateChannel = async (req, res) => {
    const { id } = req.params;
    const { name, commission_rate, settlement_lag_days } = req.body;
    if (!name || commission_rate === undefined || settlement_lag_days === undefined) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }
    try {
        const [result] = await db.query(
            'UPDATE channels SET name = ?, commission_rate = ?, settlement_lag_days = ? WHERE id = ?',
            [name, commission_rate, settlement_lag_days, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Channel not found' });
        }
        res.status(200).json({ status: 'success', message: 'Channel updated successfully' });
    } catch (error) {
        console.error('Error updating channel:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

exports.deleteChannel = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM channels WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Channel not found' });
        }
        res.status(200).json({ status: 'success', message: 'Channel deleted successfully' });
    } catch (error) {
        console.error('Error deleting channel:', error);
        res.status(500).json({ status: 'error', message: 'Failed to delete channel. It may be used in other records.' });
    }
};
