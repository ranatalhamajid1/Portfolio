const Database = require('better-sqlite3');
const path = require('path');

const dbPath = './portfolio.db';
console.log('🔄 Setting up SQLite database...');
console.log('📁 Database will be created at:', path.resolve(dbPath));
console.log('📅 Setup time:', new Date().toLocaleString());

const db = new Database(dbPath);

// Create tables
const createTables = `
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
`;
db.exec(createTables);
console.log('✅ Tables created successfully');

// Insert initial site_stats
db.prepare(`
    INSERT OR IGNORE INTO site_stats (id, page_views, unique_visitors, total_contacts, total_downloads)
    VALUES (1, 0, 0, 0, 0)
`).run();

console.log('✅ Initial site stats inserted');

// Insert test contact
db.prepare(`
    INSERT OR IGNORE INTO contacts (name, email, message, status)
    VALUES (?, ?, ?, ?)
`).run('Test User', 'test@example.com', 'Test message to verify setup.', 'unread');

console.log('✅ Test contact data inserted');

// List tables
const tables = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
`).all();

console.log('✅ Tables created:', tables.map(t => t.name).join(', '));

db.close();
console.log('✅ Database setup completed successfully!');
console.log('📁 Database file at:', path.resolve(dbPath));
console.log('🚀 You can now run: npm run dev');
