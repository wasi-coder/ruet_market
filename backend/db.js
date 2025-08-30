const mysql = require('mysql2');
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'yourpassword', // <-- change to your MySQL password
    database: 'ruet_marketplace'
});
module.exports = pool.promise();