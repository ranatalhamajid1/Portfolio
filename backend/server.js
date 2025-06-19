// Required Modules
const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const db = require('./db');
const { initializeDatabase, verifyEmailConfig } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'securesecret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true with HTTPS
}));

// ✅ Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// ✅ Serve homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Helpers
function requireAdmin(req, res, next) {
    if (req.session && req.session.adminLoggedIn) {
        return next();
    }
    return res.status(401).json({ success: false, message: 'Unauthorized' });
}

function getClientIP(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

// Admin dashboard data
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
        if (!db.isConnected) {
            return res.status(500).json({ success: false, message: 'Database not connected' });
        }

        const totalMessages = await db.get('SELECT COUNT(*) as count FROM contacts');
        const unreadMessages = await db.get('SELECT COUNT(*) as count FROM contacts WHERE status = "unread"');
        const totalDownloads = await db.get('SELECT COUNT(*) as count FROM download_logs');
        const recentMessages = await db.getRecentContacts(10);
        const downloadsByDate = await db.all(`
            SELECT DATE(downloaded_at) as date, COUNT(*) as count 
            FROM download_logs 
            WHERE downloaded_at >= datetime('now', '-30 days')
            GROUP BY DATE(downloaded_at)
            ORDER BY date DESC 
            LIMIT 30
        `);
        const siteStats = await db.getStats();

        res.json({
            success: true,
            data: {
                totalMessages: totalMessages.count,
                unreadMessages: unreadMessages.count,
                totalDownloads: totalDownloads.count,
                recentMessages,
                downloadsByDate,
                siteStats,
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats: ' + error.message });
    }
});

app.post('/api/admin/mark-read/:id', requireAdmin, async (req, res) => {
    try {
        const messageId = parseInt(req.params.id);

        if (!db.isConnected) {
            return res.status(500).json({ success: false, message: 'Database not connected' });
        }

        const result = await db.run('UPDATE contacts SET status = ? WHERE id = ?', ['read', messageId]);

        if (result.changes > 0) {
            console.log(`📧 Message ${messageId} marked as read by ${req.session.adminUsername}`);
            res.json({ success: true, message: 'Message marked as read' });
        } else {
            res.status(404).json({ success: false, message: 'Message not found' });
        }
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ success: false, message: 'Failed to update message status' });
    }
});

app.delete('/api/admin/message/:id', requireAdmin, async (req, res) => {
    try {
        const messageId = parseInt(req.params.id);

        if (!db.isConnected) {
            return res.status(500).json({ success: false, message: 'Database not connected' });
        }

        const result = await db.run('DELETE FROM contacts WHERE id = ?', [messageId]);

        if (result.changes > 0) {
            console.log(`🗑️  Message ${messageId} deleted by ${req.session.adminUsername}`);
            res.json({ success: true, message: 'Message deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Message not found' });
        }
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete message' });
    }
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
    const username = req.session.adminUsername;

    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction failed:', err);
            return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        console.log(`🔐 Admin logout: ${username} at ${new Date().toLocaleString()}`);
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

app.get('/api/admin/check', (req, res) => {
    if (req.session.adminLoggedIn) {
        res.json({
            success: true,
            authenticated: true,
            user: req.session.adminUsername,
            loginTime: req.session.loginTime
        });
    } else {
        res.json({ success: true, authenticated: false });
    }
});

app.get('/admin', (req, res) => {
    if (req.session.adminLoggedIn) {
        res.sendFile(path.join(__dirname, '../frontend/admin.html'));
    } else {
        res.redirect('/admin-login');
    }
});

app.get('/admin-login', (req, res) => {
    try {
        console.log('📄 Serving ultimate login page to:', req.ip || 'unknown IP');
        res.sendFile(path.join(__dirname, '../frontend/ultimate-login.html'));
    } catch (error) {
        console.error('❌ Error serving login page:', error);
        res.status(500).send('Login page error: ' + error.message);
    }
});

app.get('/login', (req, res) => res.redirect('/admin-login'));

app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const clientIP = getClientIP(req);

        console.log('🔐 Login attempt received:', username);

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }

        const isValidUsername = username === process.env.ADMIN_USERNAME;
        const isValidPassword = password === process.env.ADMIN_PASSWORD;

        if (isValidUsername && isValidPassword) {
            req.session.adminLoggedIn = true;
            req.session.adminUsername = username;
            req.session.loginTime = new Date().toISOString();

            console.log('✅ Login successful for:', username);

            res.json({
                success: true,
                message: 'Login successful',
                user: username,
                loginTime: req.session.loginTime
            });
        } else {
            console.log('❌ Invalid credentials for:', username);
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('❌ Login endpoint error:', error);
        res.status(500).json({ success: false, message: 'Internal server error: ' + error.message });
    }
});

// 🔧 Error Handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// 🚫 404 Handler (Keep LAST)
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// 🔁 Graceful Shutdown
async function gracefulShutdown() {
    console.log('🔄 Shutting down gracefully...');
    try {
        await db.close();
    } catch (error) {
        console.error('❌ Error closing database:', error);
    }
    process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// 🚀 Server Start
async function startServer() {
    try {
        console.log('🚀 Starting Portfolio Backend Server...');
        await initializeDatabase();
        await verifyEmailConfig();
        console.log('✅ Binding to port:', PORT);

        app.listen(PORT, () => {
            console.log(`🚀 Server running at: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
