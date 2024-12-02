// models/servSubTypeModel.js
const { sql, poolPromise } = require('../../db');

// //const image=require('../../vault/image')


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './vault/image');
//     },
//     filename: function (req, file, cb) {
//       cb(null, `${Date.now()}_${file.originalname}`);
//     }
//   });
  
  //const upload = multer({ storage: storage });
// Fetch all service subtypes
const getAllServiceSubTypes = async () => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM serviceSubType_Master where flag=1');
        return result.recordset;
    } catch (error) {
        throw new Error(`Database Error: ${error.message}`);
    }
};

// Fetch a single service subtype by ID
const getServiceSubTypeById = async (id) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Numeric, id)
            .query(`
                SELECT * FROM serviceSubType_Master WHERE company_Id = @id and flag=1
                order by
servSubType_Id desc
                `);
        return result.recordset;
    } catch (error) {
        throw new Error(`Database Error: ${error.message}`);
    }
};

const addServiceSubType = async (data) => {
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
            .input('imagefile', sql.NVarChar(255), data.imagefile) // Pass the image path here
            .input('isActive', sql.NChar(10), data.isActive)
            .input('delivery_Time', sql.NVarChar(255), data.delivery_Time)
            .input('created_By', sql.Numeric, data.created_By)
            .input('company_Id', sql.Numeric, data.company_Id)
            .input('serv_Name', sql.NVarChar, data.serv_Name) 
            .input('created_On', sql.Date, new Date())
            .query(`
                INSERT INTO serviceSubType_Master 
                (serv_Id, servSubType_Name, servSubType_Description, rate, taxrate, discount, qty_Unit, imagefile, isActive, delivery_Time, created_By,company_Id,serv_Name,created_On)
                VALUES (@serv_Id, @servSubType_Name, @servSubType_Description, @rate, @taxrate, @discount, @qty_Unit, @imagefile, @isActive, @delivery_Time, @created_By,@company_Id,@serv_Name,@created_On)
            `);
        return result.rowsAffected[0];
    } catch (error) {
        console.log(error);
        throw new Error(`Database Error: ${error.message}`);
    }
};



// Update a service subtype
// const updateServiceSubType = async (id, data) => {
//     try {
//         const pool = await poolPromise;
//         const result = await pool.request()
//             .input('id', sql.Numeric, id)
//             .input('serv_Id', sql.Numeric, data.serv_Id)
//             .input('servSubType_Name', sql.NVarChar(100), data.servSubType_Name)
//             .input('servSubType_Description', sql.Text, data.servSubType_Description)
//             .input('rate', sql.Numeric(18, 2), data.rate)
//             .input('taxrate', sql.Numeric(18, 0), data.taxrate)
//             .input('discount', sql.Bit, data.discount)
//             .input('qty_Unit', sql.Numeric(18, 2), data.qty_Unit)
//             .input('imagefile', sql.NVarChar(255), data.imagefile)
//             .input('isActive', sql.NChar(10), data.isActive)
//             .input('delivery_Time', sql.NVarChar(255), data.delivery_Time)
//             .input('altered_By', sql.Numeric, data.altered_By)
//             .query(`
//                 UPDATE serviceSubType_Master
//                 SET serv_Id = @serv_Id, servSubType_Name = @servSubType_Name, servSubType_Description = @servSubType_Description, 
//                     rate = @rate, taxrate = @taxrate, discount = @discount, qty_Unit = @qty_Unit, imagefile = @imagefile, 
//                     isActive = @isActive, delivery_Time = @delivery_Time, altered_By = @altered_By
//                 WHERE servSubType_Id = @id
//             `);
//         return result.rowsAffected[0]; // Returns the number of rows affected
//     } catch (error) {
//         console.log(error);
//         throw new Error(`Database Error: ${error.message}`);
    
        
//     }
// };
const updateServiceSubType = async (serviceSubTypeId, data) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('serviceSubTypeId', sql.Numeric, serviceSubTypeId)
           
            .input('servSubType_Name', sql.NVarChar(100), data.servSubType_Name)
            .input('servSubType_Description', sql.Text, data.servSubType_Description)
            .input('rate', sql.Numeric(18, 2), data.rate)
            .input('taxrate', sql.Numeric(18, 0), data.taxrate)
            .input('discount', sql.Bit, data.discount)
            .input('qty_Unit', sql.Numeric(18, 2), data.qty_Unit)
            .input('imagefile', sql.NVarChar(255), data.imagefile)  // Pass image path if available
            .input('isActive', sql.NChar(10), data.isActive)
            .input('delivery_Time', sql.NVarChar(255), data.delivery_Time)
            .input('created_By', sql.Numeric, data.created_By)
            .input('company_Id', sql.Numeric, data.company_Id)
            // .input('serv_Name', sql.NVarChar, data.serv_Name)
            .query(`
                UPDATE serviceSubType_Master 
                SET 
                     
                    servSubType_Name = @servSubType_Name, 
                    servSubType_Description = @servSubType_Description, 
                    rate = @rate, 
                    taxrate = @taxrate, 
                    discount = @discount, 
                    qty_Unit = @qty_Unit, 
                    imagefile = ISNULL(@imagefile, imagefile),  -- Only update image if a new one is uploaded
                    isActive = @isActive, 
                    delivery_Time = @delivery_Time, 
                    created_By = @created_By,
                    company_Id = @company_Id
                  
                WHERE servSubType_Id = @serviceSubTypeId
            `);

        return result.rowsAffected[0];  // Return the number of rows updated
    } catch (error) {
        console.log(error);
        throw new Error(`Database Error: ${error.message}`);
    }
};

// Delete a service subtype
const deleteServiceSubType = async (id) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Numeric, id)
            .query(` 
                UPDATE serviceSubType_Master 
                SET flag = 0

                
                
                WHERE servSubType_Id = @id`);
        return result.rowsAffected[0]; // Returns the number of rows affected
    } catch (error) {
        throw new Error(`Database Error: ${error.message}`);
    }
};

module.exports = {
   
    getAllServiceSubTypes,
    getServiceSubTypeById,
    addServiceSubType,
    updateServiceSubType,
    deleteServiceSubType
};
