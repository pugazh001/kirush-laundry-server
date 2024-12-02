// models/adminModel.js
const { sql, poolPromise } = require('../../db');

// Insert into company_Master and return company_Id
const addCompany = async (companyName, email, mobileId) => {
   
    const pool = await poolPromise;
  const result = await pool.request()
    .input('companyName', sql.VarChar, companyName)
    .input('email', sql.VarChar, email)
    .input('mobileId', sql.VarChar, mobileId)
    .query(`
      INSERT INTO company_Master (company_Name, email, mobile_No)
      OUTPUT inserted.company_Id
      VALUES (@companyName, @email, @mobileId)
    `);

  return result.recordset[0].company_Id;
};

// Insert into user_Master
const addUser = async (username, usercode,  company_Id,mobileId,email) => {
    const pool = await poolPromise;
    const userTypeId = 2;
  await pool.request()
    .input('username', sql.VarChar, username)
    .input('usercode', sql.VarChar, usercode)
    .input('usertypeId', sql.Numeric, userTypeId)
    .input('company_Id',sql.Numeric, company_Id)
    .input('email', sql.VarChar, email)
    .input('mobileId', sql.VarChar, mobileId)
    .query(`
      INSERT INTO user_Master (user_Name, user_Code, user_Type_ID, company_Id,email_ID,mobile_Number)
      VALUES (@username, @usercode, @usertypeId, @company_Id,@email,@mobileId)
    `);
};

module.exports = { addCompany, addUser };
