const { poolPromise,sql } = require('../../db');



// Deliveryman Model
class DeliverymanModel {
    // static async createDeliveryman(user_Code, user_Name, mobile_Number, email_ID, alternativeNumber, city, address, company_Id) {
    //     const pool = await poolPromise; // Get the connection pool
    //     try {
    //         // Check if email_ID already exists
    //         const emailCheckResult = await pool.request()
    //             .input('email_ID', sql.NVarChar(100), email_ID)
    //             .query(`
    //                 SELECT COUNT(*) AS count
    //                 FROM user_Master
    //                 WHERE email_ID = @email_ID
    //             `);
            
    //         if (emailCheckResult.recordset[0].count > 0) {
    //             throw new Error('Email already exists');
    //         }

    //         // Insert into user_Master table
    //         await pool.request()
    //             .input('user_Code', sql.VarChar(50), user_Code)
    //             .input('user_Name', sql.NVarChar(100), user_Name)
    //             .input('user_Type_Id', sql.Int, 4) // Assuming user_Type_Id for deliveryman is 3
    //             .input('mobile_Number', sql.NVarChar(15), mobile_Number)
    //             .input('email_ID', sql.NVarChar(100), email_ID)
    //             .query(`
    //                 INSERT INTO user_Master (user_Code, user_Name, user_Type_Id, mobile_Number, email_ID)
    //                 VALUES (@user_Code, @user_Name, @user_Type_Id, @mobile_Number, @email_ID)
    //             `);

    //         // Insert into deliveryman table
    //         await pool.request()
    //             .input('deliveryman_name', sql.NVarChar(100), user_Name)
    //             .input('contact', sql.NVarChar(15), mobile_Number)
    //             .input('email', sql.NVarChar(100), email_ID)
    //             .input('d_code', sql.VarChar(50), user_Code)
    //             .input('alternativeNumber', sql.VarChar(15), alternativeNumber)
    //             .input('city', sql.VarChar(50), city)
    //             .input('address', sql.VarChar(255), address)
    //             .input('company_Id', sql.Int, company_Id)
    //             .query(`
    //                 INSERT INTO deliveryman (deliveryman_name, contact, email, d_code, alternativeNumber, city, address, company_Id)
    //                 VALUES (@deliveryman_name, @contact, @email, @d_code, @alternativeNumber, @city, @address, @company_Id)
    //             `);

    //         return true; // Return success
    //     } catch (error) {
    //         console.error(error);
    //         throw new Error('Database operation failed: ' + error.message);
    //     }
    // }
    static async createDeliveryman(user_Code, user_Name, mobile_Number, email_ID, alternativeNumber, city, address, company_Id) {
      const pool = await poolPromise; // Get the connection pool
      let transaction;
  
      try {
          transaction = new sql.Transaction(pool);
          await transaction.begin();
  
          // Check if email_ID already exists
          const emailCheckResult = await transaction.request()
              .input('email_ID', sql.NVarChar(100), email_ID)
              .query(`
                  SELECT COUNT(*) AS count
                  FROM user_Master
                  WHERE email_ID = @email_ID
              `);
  
          if (emailCheckResult.recordset[0].count > 0) {
              throw new Error('Email already exists');
          }
  
          // Insert into user_Master table
          await transaction.request()
              .input('user_Code', sql.VarChar(50), user_Code)
              .input('user_Name', sql.NVarChar(100), user_Name)
              .input('user_Type_Id', sql.Int, 4) // Assuming user_Type_Id for deliveryman is 4
              .input('mobile_Number', sql.NVarChar(15), mobile_Number)
              .input('email_ID', sql.NVarChar(100), email_ID)
              .query(`
                  INSERT INTO user_Master (user_Code, user_Name, user_Type_Id, mobile_Number, email_ID)
                  VALUES (@user_Code, @user_Name, @user_Type_Id, @mobile_Number, @email_ID)
              `);
  
          // Insert into deliveryman table
          await transaction.request()
              .input('deliveryman_name', sql.NVarChar(100), user_Name)
              .input('contact', sql.NVarChar(15), mobile_Number)
              .input('email', sql.NVarChar(100), email_ID)
              .input('d_code', sql.VarChar(50), user_Code)
              .input('alternativeNumber', sql.VarChar(15), alternativeNumber)
              .input('city', sql.VarChar(50), city)
              .input('address', sql.VarChar(255), address)
              .input('company_Id', sql.Int, company_Id)
              .query(`
                  INSERT INTO deliveryman (deliveryman_name, contact, email, d_code, alternativeNumber, city, address, company_Id)
                  VALUES (@deliveryman_name, @contact, @email, @d_code, @alternativeNumber, @city, @address, @company_Id)
              `);
  
          // Get the deliveryman_id from deliveryman table
          const deliverymanResult = await transaction.request()
              .input('d_code', sql.VarChar(50), user_Code)
              .query(`
                  SELECT deliveryman_id
                  FROM deliveryman
                  WHERE d_code = @d_code
              `);
  
          const deliverymanId = deliverymanResult.recordset[0]?.deliveryman_id;
  
          if (!deliverymanId) {
              throw new Error('Failed to retrieve deliveryman_id');
          }
  
          // Update the user_Master table with the deliveryman_id
          await transaction.request()
              .input('deliveryman_id', sql.Int, deliverymanId)
              .input('user_Code', sql.VarChar(50), user_Code)
              .query(`
                  UPDATE user_Master
                  SET deliveryman_id = @deliveryman_id
                  WHERE user_Code = @user_Code
              `);
  
          await transaction.commit(); // Commit the transaction
  
          return true; // Return success
  
      } catch (error) {
          if (transaction) await transaction.rollback();
          console.error(error);
          throw new Error('Database operation failed: ' + error.message);
      }
  }
  
    // Function to get all deliverymen based on company_id
 static async  getDeliverymenByCompanyId(company_id) {
    try {
      const pool = await  poolPromise;
      const result = await pool.request()
        .input('company_id', sql.Int, company_id)
        .query(`SELECT * FROM deliveryman WHERE company_id = @company_id AND flag=1
        --  order by 
--deliveryman_id desc
          `);
      return result.recordset;
    } catch (err) {
      throw new Error('Error fetching deliverymen: ' + err.message);
    }
  }
  
  // Function to get a single deliveryman by deliveryman_id
 static async getDeliverymanById(deliveryman_id) {
    try {
      const pool = await  poolPromise;
      const result = await pool.request()
        .input('deliveryman_id', sql.Int, deliveryman_id)
        .query('SELECT * FROM deliveryman WHERE deliveryman_id = @deliveryman_id');
      return result.recordset[0];
    } catch (err) {
      throw new Error('Error fetching deliveryman: ' + err.message);
    }
  }
}

module.exports = DeliverymanModel;
