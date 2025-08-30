const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const { name, email, password, ruet_id } = req.body;
    if (!name || !email || !password || !ruet_id) return res.status(400).json({ error: "All fields required" });
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await db.query(
            'INSERT INTO users (name, email, password, ruet_id) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, ruet_id]
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
    if (!valid) return res.status(400).json({ error: "Invalid email or password" });
    // Simple: return user data (in production, use JWT!)
    res.json({ user: { id: user.id, name: user.name, ruet_id: user.ruet_id } });
});

module.exports = router;