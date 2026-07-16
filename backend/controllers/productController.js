const db = require('../config/db');

exports.getAllProducts = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products ORDER BY id ASC');
        res.status(200).json({ status: 'success', data: rows });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

exports.createProduct = async (req, res) => {
    const { name, price, default_hpp } = req.body;
    if (!name || !price || !default_hpp) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO products (name, price, default_hpp) VALUES (?, ?, ?)',
            [name, price, default_hpp]
        );
        res.status(201).json({
            status: 'success',
            data: { id: result.insertId, name, price, default_hpp }
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, default_hpp } = req.body;
    if (!name || !price || !default_hpp) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }
    try {
        const [result] = await db.query(
            'UPDATE products SET name = ?, price = ?, default_hpp = ? WHERE id = ?',
            [name, price, default_hpp, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Product not found' });
        }
        res.status(200).json({ status: 'success', message: 'Product updated successfully' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Product not found' });
        }
        res.status(200).json({ status: 'success', message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ status: 'error', message: 'Failed to delete product. It may be used in other records.' });
    }
};
