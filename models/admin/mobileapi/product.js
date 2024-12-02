const { poolPromise,sql } = require('../../../db');

const addServiceSubTypeMobile = async (data) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('serv_Id', sql.Numeric, data.serv_Id)
            .input('servSubType_Name', sql.NVarChar(100), data.servSubType_Name)
            .input('servSubType_Description', sql.Text, data.servSubType_Description)
            .input('rate', sql.Numeric(18, 2), data.rate)
            .input('taxrate', sql.Numeric(18, 0), data.taxrate)
            .input('discount', sql.Bit, data.discount)
            .input('qty_Unit', sql.Numeric(18, 2), data.qty_Unit)
            .input('imagefile', sql.Text, data.imagefile) // Pass the Base64 string here
            .input('isActive', sql.NChar(10), data.isActive)
            .input('delivery_Time', sql.NVarChar(255), data.delivery_Time)
            .input('created_By', sql.Numeric, data.created_By)
            .input('company_Id', sql.Numeric, data.company_Id)
            .input('serv_Name', sql.NVarChar, data.serv_Name) 
            .query(`
                INSERT INTO serviceSubType_Master 
                (serv_Id, servSubType_Name, servSubType_Description, rate, taxrate, discount, qty_Unit, imagefile, isActive, delivery_Time, created_By, company_Id, serv_Name)
                VALUES (@serv_Id, @servSubType_Name, @servSubType_Description, @rate, @taxrate, @discount, @qty_Unit, @imagefile, @isActive, @delivery_Time, @created_By, @company_Id, @serv_Name)
            `);
        return result.rowsAffected[0];
    } catch (error) {
        console.log(error);
        throw new Error(`Database Error: ${error.message}`);
    }
};
module.exports = {addServiceSubTypeMobile}