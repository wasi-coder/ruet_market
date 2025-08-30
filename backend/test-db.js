const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        console.log('Testing MySQL connection...');
        console.log('Host: localhost');
        console.log('User: root');
        console.log('Password: wasi123');
        console.log('Database: ruet_marketplace');
        
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'wasi123',
            database: 'ruet_marketplace'
        });
        
        console.log('✅ MySQL connection successful!');
        
        // Test a simple query
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
        console.log('Users table count:', rows[0].count);
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ MySQL connection failed:');
        console.error('Error:', error.message);
        console.error('Code:', error.code);
        console.error('Errno:', error.errno);
    }
}

testConnection();
