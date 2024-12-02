const sql = require('mssql');
require('dotenv').config(); 

// Configure your database connection here
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server:  process.env.DB_SERVER, // example: 'localhost'
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, // Use encryption if needed
        trustServerCertificate: true // If you're using self-signed certs
    }
};

// Create a pool promise for connection reuse
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to SQL Server');
        return pool;
    })
    .catch(err => {
        console.error('Database connection error:', err);
        process.exit(1); // Exit process on failure
    });

module.exports = { sql, poolPromise };
