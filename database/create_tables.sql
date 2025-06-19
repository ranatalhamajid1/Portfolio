-- Use the portfolio database
USE portfolio_db;

-- Create contacts table
CREATE TABLE contacts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    message NTEXT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    status NVARCHAR(20) DEFAULT 'unread',
    ip_address NVARCHAR(45),
    user_agent NTEXT
);

-- Create download_logs table
CREATE TABLE download_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ip_address NVARCHAR(45),
    user_agent NTEXT,
    downloaded_at DATETIME2 DEFAULT GETDATE(),
    file_name NVARCHAR(255) DEFAULT 'resume.pdf'
);

-- Create admin_sessions table
CREATE TABLE admin_sessions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    session_id NVARCHAR(255) UNIQUE,
    user_id NVARCHAR(255),
    created_at DATETIME2 DEFAULT GETDATE(),
    expires_at DATETIME2,
    is_active BIT DEFAULT 1
);

-- Create site_stats table
CREATE TABLE site_stats (
    id INT IDENTITY(1,1) PRIMARY KEY,
    page_views INT DEFAULT 0,
    unique_visitors INT DEFAULT 0,
    total_contacts INT DEFAULT 0,
    total_downloads INT DEFAULT 0,
    last_updated DATETIME2 DEFAULT GETDATE()
);

-- Insert initial stats
INSERT INTO site_stats (page_views, unique_visitors, total_contacts, total_downloads) 
VALUES (0, 0, 0, 0);

-- Create indexes for better performance
CREATE INDEX IX_contacts_status ON contacts(status);
CREATE INDEX IX_contacts_created ON contacts(created_at);
CREATE INDEX IX_downloads_date ON download_logs(downloaded_at);

-- Insert sample data for testing
INSERT INTO contacts (name, email, message) VALUES 
('John Doe', 'john@example.com', 'Great portfolio! Would love to discuss opportunities.'),
('Jane Smith', 'jane@example.com', 'Interested in your web development services.');

-- Select all to verify
SELECT * FROM contacts;
SELECT * FROM download_logs;
SELECT * FROM site_stats;