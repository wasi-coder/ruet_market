const mysql = require('mysql2');
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'wasi123', 
    database: 'ruet_marketplace'
});
module.exports = pool.promise();

db.connect(err => {
    if (err) throw err;
    console.log('✅ MySQL connected...');
});