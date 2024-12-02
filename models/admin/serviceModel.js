const { poolPromise,sql } = require('../../db'); // Assuming you have a db connection file
//const sql = require('mssql');

// Add a new service type to serviceType_Master table
const addServiceType = async (servType_Name, company_Id) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('servType_Name', sql.NVarChar, servType_Name)
        .input('company_Id', sql.Numeric, company_Id)
        .input('isActive', sql.Bit, 1) // Assuming active by default
        .query(`
            INSERT INTO serviceType_Master (servType_Name, company_Id, isActive)
            OUTPUT INSERTED.servType_Id
            VALUES (@servType_Name, @company_Id, @isActive)
        `);
    return result.recordset[0].servType_Id; // Returning the inserted servType_Id
};

// Add a new service to the service_Master table
const addService = async ({serv_Code, serv_Name, serv_Description, servType_Id, company_Id, imagefile, created_By}) => {
    const pool = await poolPromise;
    await pool.request()
        .input('serv_Code', sql.NVarChar, serv_Code)
        .input('serv_Name', sql.NVarChar, serv_Name)
        .input('serv_Description', sql.Text, serv_Description)
        .input('servType_Id', sql.Numeric, servType_Id)
        .input('isActive', sql.Bit, 1) // Assuming active by default
        .input('company_Id', sql.Numeric, company_Id)
        .input('imagefile', sql.NVarChar, imagefile)
        .input('created_On', sql.Date, new Date())
        .input('created_By', sql.Numeric, created_By)
        .query(`
            INSERT INTO service_Master 
            (serv_Code, serv_Name, serv_Description, servType_Id, isActive, company_Id, imagefile, created_On, created_By)
            VALUES 
            (@serv_Code, @serv_Name, @serv_Description, @servType_Id, @isActive, @company_Id, @imagefile, @created_On, @created_By)
        `);
};

const getCompanyIdByUserId = async (userId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('userId', sql.NVarChar, userId)
        .query(`
            SELECT company_Id 
            FROM user_Master 
            WHERE user_Code = @userId
        `);
    return result.recordset[0]; // Assuming there’s always one result
};






// update 

// Update an existing service in the service_Master table
// const updateService = async ({serv_Id, serv_Code, serv_Name, serv_Description, servType_Id, company_Id, imagefile, altered_By}) => {
//     const pool = await poolPromise;
//     let query = 'UPDATE service_Master SET ';
//     const queryParams = [];
    
//     // Dynamically build the query based on provided fields
//     if (serv_Code !== undefined) {
//         query += 'serv_Code = @serv_Code, ';
//         queryParams.push({ name: 'serv_Code', type: sql.NVarChar, value: serv_Code });
//     }
//     if (serv_Name !== undefined) {
//         query += 'serv_Name = @serv_Name, ';
//         queryParams.push({ name: 'serv_Name', type: sql.NVarChar, value: serv_Name });
//     }
//     if (serv_Description !== undefined) {
//         query += 'serv_Description = @serv_Description, ';
//         queryParams.push({ name: 'serv_Description', type: sql.Text, value: serv_Description });
//     }
//     if (servType_Id !== undefined) {
//         query += 'servType_Id = @servType_Id, ';
//         queryParams.push({ name: 'servType_Id', type: sql.Numeric, value: servType_Id });
//     }
//     if (company_Id !== undefined) {
//         query += 'company_Id = @company_Id, ';
//         queryParams.push({ name: 'company_Id', type: sql.Numeric, value: company_Id });
//     }
//     if (imagefile !== undefined) {
//         query += 'imagefile = @imagefile, ';
//         queryParams.push({ name: 'imagefile', type: sql.NVarChar, value: imagefile });
//     }

//     // Always update altered_On and altered_By fields
//     query += 'altered_On = @altered_On, altered_By = @altered_By WHERE serv_Id = @serv_Id';
//     queryParams.push({ name: 'altered_On', type: sql.Date, value: new Date() });
//     queryParams.push({ name: 'altered_By', type: sql.Numeric, value: altered_By });
//     queryParams.push({ name: 'serv_Id', type: sql.Numeric, value: serv_Id });

//     // Prepare and execute the query
//     const request = pool.request();
//     queryParams.forEach(param => request.input(param.name, param.type, param.value));
    
//     await request.query(query);
// };

const updateService = async ({serv_Id, serv_Code, serv_Name, serv_Description, servType_Id, company_Id, imagefile, altered_By}) => {
    const pool = await poolPromise;
    
    // Building the update query for service_Master
    let query = 'UPDATE service_Master SET ';
    const queryParams = [];
    
    if (serv_Code !== undefined) {
        query += 'serv_Code = @serv_Code, ';
        queryParams.push({ name: 'serv_Code', type: sql.NVarChar, value: serv_Code });
    }
    if (serv_Name !== undefined) {
        query += 'serv_Name = @serv_Name, ';
        queryParams.push({ name: 'serv_Name', type: sql.NVarChar, value: serv_Name });
    }
    if (serv_Description !== undefined) {
        query += 'serv_Description = @serv_Description, ';
        queryParams.push({ name: 'serv_Description', type: sql.Text, value: serv_Description });
    }
    if (servType_Id !== undefined) {
        query += 'servType_Id = @servType_Id, ';
        queryParams.push({ name: 'servType_Id', type: sql.Numeric, value: servType_Id });
    }
    if (company_Id !== undefined) {
        query += 'company_Id = @company_Id, ';
        queryParams.push({ name: 'company_Id', type: sql.Numeric, value: company_Id });
    }
    if (imagefile !== undefined) {
        query += 'imagefile = @imagefile, ';
        queryParams.push({ name: 'imagefile', type: sql.NVarChar, value: imagefile });
    }

    // Update altered_On and altered_By fields
    query += 'altered_On = @altered_On, altered_By = @altered_By WHERE serv_Id = @serv_Id';
    queryParams.push({ name: 'altered_On', type: sql.Date, value: new Date() });
    queryParams.push({ name: 'altered_By', type: sql.Numeric, value: altered_By });
    queryParams.push({ name: 'serv_Id', type: sql.Numeric, value: serv_Id });

    // Prepare and execute the first query for service_Master
    const request = pool.request();
    queryParams.forEach(param => request.input(param.name, param.type, param.value));
    await request.query(query);

    // Update serv_Name in serviceSubType_Master if serv_Name is provided
    if (serv_Name !== undefined) {
        const subTypeQuery = `
            UPDATE serviceSubType_Master 
            SET serv_Name = @serv_Name 
            WHERE serv_Id = @serv_Id
        `;
        const subTypeRequest = pool.request();
        subTypeRequest.input('serv_Name', sql.NVarChar, serv_Name);
        subTypeRequest.input('serv_Id', sql.Numeric, serv_Id);
        await subTypeRequest.query(subTypeQuery);
    }
};

//delete services

// // Soft delete a service by updating isActive to 0
// const deleteService = async (serv_Id) => {
//     const pool = await poolPromise;
//     await pool.request()
//         .input('serv_Id', sql.Numeric, serv_Id)
//         .query(`
//             UPDATE service_Master 
//             SET isActive = 0
//             WHERE serv_Id = @serv_Id
//         `);
// };

const deleteService = async (serv_Id) => {
    try {
        const pool = await poolPromise;

        // Begin a transaction to ensure both updates succeed or fail together
        const transaction = pool.transaction();
        await transaction.begin();

        // Update the service_Master table to set isActive to 0
        await transaction.request()
            .input('serv_Id', sql.Numeric, serv_Id)
            .query(`
                UPDATE service_Master 
                SET isActive = 0
                WHERE serv_Id = @serv_Id
            `);

        // Update the serviceSubType_Master table to set isActive to 0 where serv_Id matches
        await transaction.request()
            .input('serv_Id', sql.Numeric, serv_Id)
            .query(`
                UPDATE serviceSubType_Master 
                SET flag = 0
                WHERE serv_Id = @serv_Id
            `);

        // Commit the transaction
        await transaction.commit();
        console.log(`Service with ID ${serv_Id} soft deleted successfully.`);
    } catch (err) {
        console.error('Error deleting service:', err);
        // Rollback the transaction in case of an error
        await transaction.rollback();
        throw err; // Re-throw the error to handle it further up if needed
    }
};

//get all serives
// Get all active services from service_Master table
const getAllServices = async () => {
    const pool = await poolPromise;
    const result = await pool.request()
        .query(`
            SELECT * FROM service_Master 
            WHERE isActive = 1
        `);
    return result.recordset;
};

// Get services for a specific company_Id
const getServicesByCompanyId = async (company_Id) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('company_Id', sql.Numeric, company_Id)
        .query(`
            SELECT * FROM service_Master 
            WHERE company_Id = @company_Id AND isActive = 1

            ORDER BY 
       serv_Id DESC;
        `);
    return result.recordset;
};

// const getServicesByServiceName = async()=> {
//     const pool = await poolPromise;
//     const result = await pool.request()
//         .input('company_Id', sql.Numeric, company_Id)
//         .query(`
//             SELECT * FROM service_Master 
//             WHERE company_Id = @company_Id AND isActive = 1
//         `);
//     return result.recordset;
// };
module.exports = {
    addServiceType,
    addService,
    getCompanyIdByUserId,
    getServicesByCompanyId,
    getAllServices,
    updateService,
    deleteService
};
