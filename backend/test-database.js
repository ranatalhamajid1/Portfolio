const SQLiteDatabase = require('./database-sqlite');

async function testDB() {
    console.log('🔄 Testing database connection...');
    const db = new SQLiteDatabase();
    
    try {
        await db.connect();
        await db.testConnection();
        
        const stats = await db.getStats();
        console.log('📊 Current stats:', stats);
        
        const contacts = await db.getRecentContacts(5);
        console.log('📧 Recent contacts:', contacts.length);
        
        const health = await db.healthCheck();
        console.log('💚 Health check:', health);
        
        await db.close();
        console.log('✅ Database test completed successfully!');
        console.log('🚀 Ready to start server with: npm run dev');
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
    }
}

testDB();