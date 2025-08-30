const express = require('express');
const db = require('../db');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Import notification functions
const { sendEmailNotification, sendSMSNotification, getUserNotificationPreferences } = require('./notifications');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only image files are allowed!'));
    }
});

// Get all buy requests
router.get('/', async (req, res) => {
    const [rows] = await db.query('SELECT buy_requests.*, users.name as requester_name FROM buy_requests JOIN users ON buy_requests.user_id = users.id ORDER BY buy_requests.created_at DESC');
    res.json(rows);
});

// Add buy request
router.post('/', upload.single('image'), async (req, res) => {
    const { user_id, title, description, category, max_price, contact_phone } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    // Debug logging
    console.log('Received data:', { user_id, title, description, category, max_price, contact_phone, image });
    console.log('Raw body:', JSON.stringify(req.body, null, 2));

    // Trim whitespace from string fields
    const trimmedTitle = title ? title.trim() : '';
    const trimmedDescription = description ? description.trim() : '';
    const trimmedCategory = category ? category.trim() : '';

    if (!user_id || !trimmedTitle || !trimmedDescription || !trimmedCategory) {
        console.log('Validation failed:', {
            user_id: !!user_id,
            title: !!trimmedTitle,
            description: !!trimmedDescription,
            category: !!trimmedCategory
        });
        return res.status(400).json({
            error: "Required fields missing",
            details: {
                user_id: !!user_id,
                title: !!trimmedTitle,
                description: !!trimmedDescription,
                category: !!trimmedCategory
            }
        });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO buy_requests (user_id, title, description, category, max_price, image) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, trimmedTitle, trimmedDescription, trimmedCategory, max_price || null, image]
        );

        // Send confirmation notification to the user
        const [userRows] = await db.execute(
            'SELECT name, email, phone, email_notifications, sms_notifications FROM users WHERE id = ?',
            [user_id]
        );

        if (userRows.length > 0) {
            const user = userRows[0];
            const message = `Your buy request "${trimmedTitle}" has been posted successfully in the ${trimmedCategory} category!`;

            // Send email if enabled
            if (user.email_notifications && user.email) {
                await sendEmailNotification(user.email, 'Buy Request Posted', message);
            }

            // Send SMS if enabled
            if (user.sms_notifications && user.phone) {
                await sendSMSNotification(user.phone, message);
            }

            // Log notification in database
            await db.execute(
                'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
                [user_id, 'buy_request_posted', message]
            );
        }

        res.json({ message: "Buy request added successfully", id: result.insertId });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Post reply to buy request
router.post('/:id/reply', async (req, res) => {
    const { id } = req.params;
    const { replier_id, message } = req.body;

    if (!replier_id || !message) {
        return res.status(400).json({ error: "Replier ID and message are required" });
    }

    try {
        // Insert the reply
        await db.query(
            'INSERT INTO buy_request_replies (buy_request_id, replier_id, message) VALUES (?, ?, ?)',
            [id, replier_id, message]
        );

        // Get buy request details and owner
        const [requestRows] = await db.execute(
            'SELECT title, user_id FROM buy_requests WHERE id = ?',
            [id]
        );

        if (requestRows.length === 0) {
            return res.status(404).json({ error: "Buy request not found" });
        }

        const buyRequest = requestRows[0];

        // Get replier details
        const [replierRows] = await db.execute(
            'SELECT name FROM users WHERE id = ?',
            [replier_id]
        );

        const replierName = replierRows[0]?.name || 'Someone';

        // Send notification to buy request owner
        const [ownerRows] = await db.execute(
            'SELECT name, email, phone, email_notifications, sms_notifications FROM users WHERE id = ?',
            [buyRequest.user_id]
        );

        if (ownerRows.length > 0) {
            const owner = ownerRows[0];
            const notificationMessage = `${replierName} has replied to your buy request "${buyRequest.title}": "${message}"`;

            // Send email if enabled
            if (owner.email_notifications && owner.email) {
                await sendEmailNotification(owner.email, 'New Reply to Your Buy Request', notificationMessage);
            }

            // Send SMS if enabled
            if (owner.sms_notifications && owner.phone) {
                await sendSMSNotification(owner.phone, notificationMessage);
            }

            // Log notification in database
            await db.execute(
                'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
                [buyRequest.user_id, 'buy_request_reply', notificationMessage]
            );
        }

        res.json({ message: "Reply sent successfully" });
    } catch (err) {
        console.error('Error posting reply:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get replies for a buy request
router.get('/:id/replies', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute(
            'SELECT r.*, u.name as replier_name FROM buy_request_replies r JOIN users u ON r.replier_id = u.id WHERE r.buy_request_id = ? ORDER BY r.created_at DESC',
            [id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;