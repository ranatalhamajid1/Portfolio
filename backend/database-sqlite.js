const Database = require('better-sqlite3');
const path = require('path');

class SQLiteDatabase {
    constructor() {
        this.dbPath = process.env.DB_PATH || './portfolio.db';
        this.db = null;
    }

    connect() {
        try {
            this.db = new Database(this.dbPath, { verbose: console.log });
            this.db.pragma('foreign_keys = ON');
            console.log('✅ Connected to SQLite database');
            console.log('📁 Database file:', path.resolve(this.dbPath));
        } catch (err) {
            console.error('❌ SQLite connection failed:', err.message);
            throw err;
        }
    }

    createTables() {
        const sql = `
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'unread',
                ip_address TEXT,
                user_agent TEXT
            );
            CREATE TABLE IF NOT EXISTS download_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip_address TEXT,
                user_agent TEXT,
                downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                file_name TEXT DEFAULT 'resume.pdf'
            );
            CREATE TABLE IF NOT EXISTS admin_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE,
                user_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME,
                is_active INTEGER DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS site_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                page_views INTEGER DEFAULT 0,
                unique_visitors INTEGER DEFAULT 0,
                total_contacts INTEGER DEFAULT 0,
                total_downloads INTEGER DEFAULT 0,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            INSERT OR IGNORE INTO site_stats (id, page_views, unique_visitors, total_contacts, total_downloads) 
            VALUES (1, 0, 0, 0, 0);
            CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
            CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at);
            CREATE INDEX IF NOT EXISTS idx_downloads_date ON download_logs(downloaded_at);
            CREATE INDEX IF NOT EXISTS idx_sessions_active ON admin_sessions(is_active);
        `;
        try {
            this.db.exec(sql);
            console.log('✅ Database tables ready');
        } catch (err) {
            console.error('❌ Table creation failed:', err.message);
        }
    }

    testConnection() {
        try {
            const row = this.db.prepare("SELECT datetime('now') as current_time, 'SQLite' as db_type").get();
            console.log('✅ Database test query successful');
            console.log('📅 Database time:', row.current_time);
            console.log('💾 Database type:', row.db_type);
            return row;
        } catch (err) {
            console.error('❌ Test query failed:', err.message);
            throw err;
        }
    }

    run(sql, params = []) {
        try {
            const stmt = this.db.prepare(sql);
            const result = stmt.run(params);
            return { lastID: result.lastInsertRowid, changes: result.changes };
        } catch (err) {
            console.error('❌ Database run error:', err.message);
            console.error('SQL:', sql);
            console.error('Params:', params);
            throw err;
        }
    }

    get(sql, params = []) {
        try {
            return this.db.prepare(sql).get(params);
        } catch (err) {
            console.error('❌ Database get error:', err.message);
            console.error('SQL:', sql);
            console.error('Params:', params);
            throw err;
        }
    }

    all(sql, params = []) {
        try {
            return this.db.prepare(sql).all(params);
        } catch (err) {
            console.error('❌ Database all error:', err.message);
            console.error('SQL:', sql);
            console.error('Params:', params);
            throw err;
        }
    }

    getStats() {
        try {
            return this.get('SELECT * FROM site_stats WHERE id = 1') || {
                page_views: 0,
                unique_visitors: 0,
                total_contacts: 0,
                total_downloads: 0
            };
        } catch {
            return {
                page_views: 0,
                unique_visitors: 0,
                total_contacts: 0,
                total_downloads: 0
            };
        }
    }

    updateStats(field, increment = 1) {
        try {
            this.run(`
                UPDATE site_stats 
                SET ${field} = ${field} + ?, last_updated = datetime('now')
                WHERE id = 1
            `, [increment]);
        } catch (err) {
            console.error(`❌ Error updating ${field}:`, err.message);
        }
    }

    getRecentContacts(limit = 10) {
        try {
            return this.all(`
                SELECT 
                    id, name, email, 
                    CASE 
                        WHEN LENGTH(message) > 100 THEN SUBSTR(message, 1, 100) || '...'
                        ELSE message
                    END as preview,
                    message, created_at, status, ip_address
                FROM contacts 
                ORDER BY created_at DESC 
                LIMIT ?
            `, [limit]);
        } catch (err) {
            console.error('❌ Error getting recent contacts:', err.message);
            return [];
        }
    }

    close() {
        try {
            if (this.db) {
                this.db.close();
                console.log('✅ Database connection closed');
            }
        } catch (err) {
            console.error('❌ Error closing database:', err.message);
        }
    }

    healthCheck() {
        try {
            const testResult = this.get("SELECT datetime('now') as time");
            const tableCount = this.get(`
                SELECT COUNT(*) as count 
                FROM sqlite_master 
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
            `);

            return {
                status: 'connected',
                database_time: testResult.time,
                tables: tableCount.count,
                file_path: path.resolve(this.dbPath)
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message
            };
        }
    }
}

module.exports = SQLiteDatabase;
