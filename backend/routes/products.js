const express = require('express');
const db = require('../db');
const router = express.Router();

// Get all products with optional department filter
router.get('/', async (req, res) => {
    const { department, category, type } = req.query;
    let query = 'SELECT products.*, users.name as seller_name, users.department as seller_department FROM products JOIN users ON products.user_id = users.id';
    let params = [];
    
    if (department && department !== 'All') {
        query += ' WHERE products.department = ?';
        params.push(department);
    }
    
    if (category) {
        query += params.length > 0 ? ' AND' : ' WHERE';
        query += ' products.category = ?';
        params.push(category);
    }
    
    if (type) {
        query += params.length > 0 ? ' AND' : ' WHERE';
        query += ' products.type = ?';
        params.push(type);
    }
    
    query += ' ORDER BY products.created_at DESC';
    
    try {
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT products.*, users.name as seller_name, users.department as seller_department, users.phone as seller_phone FROM products JOIN users ON products.user_id = users.id WHERE products.id = ?', 
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add product
router.post('/', async (req, res) => {
    const { 
        user_id, 
        title, 
        description, 
        price, 
        type, 
        category, 
        department, 
        condition_rating, 
        image,
        contact_phone,
        contact_name
    } = req.body;
    
    if (!user_id || !title || !description || !price || !type || !category || !department) {
        return res.status(400).json({ error: "All required fields must be provided" });
    }
    
    try {
        await db.query(
            'INSERT INTO products (user_id, title, description, price, type, category, department, condition_rating, image, contact_phone, contact_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [user_id, title, description, price, type, category, department, condition_rating || 'Good', image || '', contact_phone || '', contact_name || '']
        );
        res.json({ message: "Product added successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get product categories
router.get('/categories/list', async (req, res) => {
    try {
        const categories = ['Books', 'Electronics', 'Bikes', 'Furniture', 'Clothing', 'Sports', 'Other'];
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT products.*, users.name as seller_name, users.department as seller_department FROM products JOIN users ON products.user_id = users.id WHERE products.category = ? ORDER BY products.created_at DESC',
            [req.params.category]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;