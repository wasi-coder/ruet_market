const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const { name, email, password, ruet_id, department, phone } = req.body;
    if (!name || !email || !password || !ruet_id || !department) return res.status(400).json({ error: "Name, email, password, RUET ID, and department are required" });
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await db.query(
            'INSERT INTO users (name, email, password, ruet_id, department, phone) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, ruet_id, department, phone || null]
        );
        res.json({ message: "Registered successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) return res.status(400).json({ error: "Invalid email or password" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(500).json({ error: "Invalid email or password" });
    // Return user data (in production, use JWT!)
    res.json({ user: { 
        id: user.id, 
        name: user.name, 
        ruet_id: user.ruet_id, 
        department: user.department,
        phone: user.phone 
    }});
});

// Get all departments
router.get('/departments', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT DISTINCT department FROM users WHERE department IS NOT NULL');
        res.json(rows.map(row => row.department));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;