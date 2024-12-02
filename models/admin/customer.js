//const sql = require('mssql');  // Assuming you're using MSSQL
const { poolPromise,sql } = require('../../db');
// Function to get users with user_Type_ID = 5
// Function to get users where user_Type_ID = 5
const getUsersByType = async () => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_Type_ID', sql.Int, 5)  // Set user_Type_ID = 5
            .query(`
                SELECT * 
                FROM user_Master 
                WHERE user_Type_ID = @user_Type_ID
            `);
        
        return result.recordset;  // Return the retrieved records
    } catch (error) {
        throw new Error(`Database query error: ${error.message}`);
    }
};

module.exports = {
    getUsersByType,
};