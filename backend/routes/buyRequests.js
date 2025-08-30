const express = require('express');
const db = require('../db');
const router = express.Router();

// Get all buy requests
router.get('/', async (req, res) => {
    const [rows] = await db.query('SELECT buy_requests.*, users.name as requester_name FROM buy_requests JOIN users ON buy_requests.user_id = users.id ORDER BY buy_requests.created_at DESC');
    res.json(rows);
});

// Add buy request
router.post('/', async (req, res) => {
    const { user_id, title, description } = req.body;
    if (!user_id || !title || !description) return res.status(400).json({ error: "All fields required" });
    try {
        await db.query(
            'INSERT INTO buy_requests (user_id, title, description) VALUES (?, ?, ?)',
            [user_id, title, description]
        );
        res.json({ message: "Buy request added" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;