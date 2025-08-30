const express = require('express');
const db = require('../db');
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
    const [rows] = await db.query('SELECT products.*, users.name as seller_name FROM products JOIN users ON products.user_id = users.id ORDER BY products.created_at DESC');
    res.json(rows);
});

// Get product by ID
router.get('/:id', async (req, res) => {
    const [rows] = await db.query('SELECT products.*, users.name as seller_name FROM products JOIN users ON products.user_id = users.id WHERE products.id = ?', [req.params.id]);
    res.json(rows[0]);
});

// Add product
router.post('/', async (req, res) => {
    const { user_id, title, description, price, type, image } = req.body;
    if (!user_id || !title || !description || !price || !type) return res.status(400).json({ error: "All fields required" });
    try {
        await db.query(
            'INSERT INTO products (user_id, title, description, price, type, image) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, title, description, price, type, image || '']
        );
        res.json({ message: "Product added" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;