const express = require('express');
const db = require('../db');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

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
router.post('/', upload.single('image'), async (req, res) => {
    const {
        user_id,
        title,
        description,
        price,
        type,
        category,
        department,
        condition,
        contactPhone
    } = req.body;

    if (!user_id || !title || !description || !price || !type || !category || !department) {
        return res.status(400).json({ error: "All required fields must be provided" });
    }

    // Handle image upload
    let imagePath = null;
    if (req.file) {
        imagePath = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
        // Fallback to URL if no file uploaded
        imagePath = req.body.image;
    }

    try {
        const [result] = await db.query(
            'INSERT INTO products (user_id, title, description, price, type, category, department, condition_rating, image, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [user_id, title, description, price, type, category, department, condition || 'Good', imagePath, contactPhone || '']
        );

        // Get the inserted product
        const [newProduct] = await db.query(
            'SELECT products.*, users.name as seller_name FROM products JOIN users ON products.user_id = users.id WHERE products.id = ?',
            [result.insertId]
        );

        res.json({ message: "Product added successfully", product: newProduct[0] });
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

// Update product
router.put('/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const {
        title,
        description,
        price,
        type,
        category,
        department,
        condition,
        contactPhone
    } = req.body;

    if (!title || !description || !price || !type || !category || !department) {
        return res.status(400).json({ error: "All required fields must be provided" });
    }

    try {
        // Check if product exists and belongs to user
        const [existingProduct] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        if (existingProduct.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Handle image upload
        let imagePath = existingProduct[0].image; // Keep existing image by default
        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`;
        } else if (req.body.image && req.body.image !== existingProduct[0].image) {
            // Update with new URL if provided
            imagePath = req.body.image;
        }

        await db.query(
            'UPDATE products SET title = ?, description = ?, price = ?, type = ?, category = ?, department = ?, condition_rating = ?, image = ?, contact_phone = ? WHERE id = ?',
            [title, description, price, type, category, department, condition || 'Good', imagePath, contactPhone || '', id]
        );

        // Get the updated product
        const [updatedProduct] = await db.query(
            'SELECT products.*, users.name as seller_name FROM products JOIN users ON products.user_id = users.id WHERE products.id = ?',
            [id]
        );

        res.json({ message: "Product updated successfully", product: updatedProduct[0] });
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete product
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    console.log('DELETE request for product ID:', id);

    try {
        // Check if product exists
        const [existingProduct] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        console.log('Existing product check:', existingProduct);

        if (existingProduct.length === 0) {
            console.log('Product not found');
            return res.status(404).json({ error: "Product not found" });
        }

        // Delete the product
        const [deleteResult] = await db.query('DELETE FROM products WHERE id = ?', [id]);
        console.log('Delete result:', deleteResult);

        console.log('Product deleted successfully');
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;