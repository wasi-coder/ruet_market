const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Configure email transporter (Gmail SMTP)
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// Configure Twilio client (only if credentials are valid)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC') && 
    process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_AUTH_TOKEN.length > 0) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Send email notification
async function sendEmailNotification(userEmail, subject, message) {
    try {
        const mailOptions = {
            from: 'RUET Marketplace <your-email@gmail.com>',
            to: userEmail,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0;">RUET Marketplace</h1>
                    </div>
                    <div style="padding: 2rem; background: #f8fafc; border-radius: 0 0 8px 8px;">
                        <h2 style="color: #1e293b;">${subject}</h2>
                        <div style="color: #374151; line-height: 1.6;">
                            ${message}
                        </div>
                        <div style="margin-top: 2rem; text-align: center;">
                            <a href="http://localhost:3000" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Visit Marketplace</a>
                        </div>
                    </div>
                </div>
            `
        };

        await emailTransporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${userEmail}`);
        return true;
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        return false;
    }
}

// Send SMS notification
async function sendSMSNotification(phoneNumber, message) {
    try {
        if (!twilioClient) {
            console.log('⚠️ SMS notifications not configured - skipping SMS');
            return false;
        }
        
        await twilioClient.messages.create({
            body: `RUET Marketplace: ${message}`,
            from: process.env.TWILIO_PHONE_NUMBER || 'your-twilio-number',
            to: phoneNumber
        });
        console.log(`✅ SMS sent to ${phoneNumber}`);
        return true;
    } catch (error) {
        console.error('❌ SMS sending failed:', error);
        return false;
    }
}

// Get user notification preferences
async function getUserNotificationPreferences(userId) {
    try {
        const [rows] = await db.execute(
            'SELECT email_notifications, sms_notifications, product_updates FROM users WHERE id = ?',
            [userId]
        );
        return rows[0] || { email_notifications: true, sms_notifications: false, product_updates: true };
    } catch (error) {
        console.error('Error getting notification preferences:', error);
        return { email_notifications: true, sms_notifications: false, product_updates: true };
    }
}

// Get user notification preferences
router.get('/preferences/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const preferences = await getUserNotificationPreferences(userId);
        res.json(preferences);
    } catch (error) {
        console.error('Error getting notification preferences:', error);
        res.status(500).json({ error: 'Failed to get preferences' });
    }
});

// Update user notification preferences
router.put('/preferences/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { emailNotifications, smsNotifications, productUpdates } = req.body;

        await db.execute(
            'UPDATE users SET email_notifications = ?, sms_notifications = ?, product_updates = ? WHERE id = ?',
            [emailNotifications, smsNotifications, productUpdates, userId]
        );

        res.json({ success: true, message: 'Notification preferences updated' });
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

// Send product update notification
router.post('/product-update', async (req, res) => {
    try {
        const { userId, productTitle, updateType } = req.body;

        // Get user details and preferences
        const [userRows] = await db.execute(
            'SELECT name, email, phone, email_notifications, sms_notifications, product_updates FROM users WHERE id = ?',
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userRows[0];
        const message = `Your product "${productTitle}" has been ${updateType} successfully!`;

        let notificationsSent = 0;

        // Send email notification if enabled
        if (user.email_notifications && user.email) {
            try {
                const emailSent = await sendEmailNotification(
                    user.email,
                    'Product Update Notification',
                    message
                );
                if (emailSent) notificationsSent++;
            } catch (err) {
                console.error('Email failed, continuing without crash:', err);
            }
        }

        // Send SMS notification if enabled
        if (user.sms_notifications && user.phone) {
            try {
                const smsSent = await sendSMSNotification(user.phone, message);
                if (smsSent) notificationsSent++;
            } catch (err) {
                console.error('SMS failed, continuing without crash:', err);
            }
        }

        // Log notification in database
        await db.execute(
            'INSERT INTO notifications (user_id, type, message, sent_at) VALUES (?, ?, ?, NOW())',
            [userId, 'product_update', message]
        );

        res.json({ 
            success: true, 
            message: `Notifications sent: ${notificationsSent}`,
            notificationsSent 
        });

    } catch (error) {
        console.error('Error sending product update notification:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});


// Send welcome notification to new users
router.post('/welcome', async (req, res) => {
    try {
        const { userId } = req.body;

        const [userRows] = await db.execute(
            'SELECT name, email, phone, email_notifications, sms_notifications FROM users WHERE id = ?',
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userRows[0];
        const welcomeMessage = `Welcome to RUET Marketplace, ${user.name}! Start buying, selling, and renting with your fellow students.`;

        let notificationsSent = 0;

        // Send welcome email
        if (user.email && user.email_notifications) {
            const emailSent = await sendEmailNotification(
                user.email,
                'Welcome to RUET Marketplace!',
                welcomeMessage
            );
            if (emailSent) notificationsSent++;
        }

        // Send welcome SMS
        if (user.phone && user.sms_notifications) {
            const smsSent = await sendSMSNotification(user.phone, welcomeMessage);
            if (smsSent) notificationsSent++;
        }

        res.json({ 
            success: true, 
            message: `Welcome notifications sent: ${notificationsSent}`,
            notificationsSent 
        });

    } catch (error) {
        console.error('Error sending welcome notification:', error);
        res.status(500).json({ error: 'Failed to send welcome notification' });
    }
});

// Get user notification history
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [rows] = await db.execute(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY sent_at DESC LIMIT 50',
            [userId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error getting notification history:', error);
        res.status(500).json({ error: 'Failed to get notification history' });
    }
});

// Test notification endpoint
router.post('/test', async (req, res) => {
    try {
        const { userId, type } = req.body;

        const [userRows] = await db.execute(
            'SELECT name, email, phone FROM users WHERE id = ?',
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userRows[0];
        const testMessage = `This is a test ${type} notification from RUET Marketplace!`;

        let results = {};

        if (type === 'email' && user.email) {
            results.email = await sendEmailNotification(
                user.email,
                'Test Email Notification',
                testMessage
            );
        }

        if (type === 'sms' && user.phone) {
            results.sms = await sendSMSNotification(user.phone, testMessage);
        }

        res.json({ 
            success: true, 
            message: 'Test notification sent',
            results 
        });

    } catch (error) {
        console.error('Error sending test notification:', error);
        res.status(500).json({ error: 'Failed to send test notification' });
    }
});

module.exports = router;
