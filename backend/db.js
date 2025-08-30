const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', // Change this to your MySQL username
    password: 'wasi123', // Change this to your MySQL password
    database: 'ruet_marketplace',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;