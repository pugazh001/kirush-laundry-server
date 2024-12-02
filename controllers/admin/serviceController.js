const serviceModel = require('../../models/admin/serviceModel');
//const userModel = require('../models/userModel');
const { sql, poolPromise } = require('../../db');
const multer = require('multer');
const path = require('path');
// Insert serviceType and service into the respective tables

// Multer storage setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/product-images'); // Directory for image uploads
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique filename for image
    }
});

const upload = multer({ storage: storage }).single('imagefile');

// Create a new service
const createService = async (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ error: 'File upload error' });
        } else if (err) {
            return res.status(500).json({ error: 'Unknown error occurred during file upload' });
        }

        const { userId, servType_Name, serv_Name, serv_Description, created_By } = req.body;

        // Check for the uploaded image
        const imagePath = req.file ? req.file.filename : null;

        // Validate the inputs
        // if (!serv_Name || !servType_Name || !serv_Description || !userId || !created_By) {
        //     return res.status(400).json({ error: 'All fields are required' });
        // }

        try {
            const pool = await poolPromise;
            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            // Get company_Id from user_Master table based on userId
            const user = await serviceModel.getCompanyIdByUserId(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const company_Id = user.company_Id;

            // Add the service type to serviceType_Master table
            const servType_Id = await serviceModel.addServiceType(servType_Name, company_Id);

            // Generate service code based on the name
            const servicePrefix = serv_Name.substring(0, 2).toUpperCase();
            const countResult = await transaction.request().query('SELECT COUNT(*) AS count FROM [service_Master]');
            const count = countResult.recordset[0].count;
            const helper = count < 10 ? `00${count + 1}` : count < 100 ? `0${count + 1}` : `${count + 1}`;
            const date = new Date();
            const serv_Code = `${servicePrefix}-${date.getFullYear()}${helper}`;

            // Add the service to service_Master table
            await serviceModel.addService({
                serv_Code,
                serv_Name,
                serv_Description,
                servType_Id,
                company_Id,
                imagefile: imagePath,
                created_By
            });

            // Commit the transaction
            await transaction.commit();

            // Success response
            res.status(200).json({ message: 'Service and ServiceType created successfully', company_Id });
        } catch (error) {
            console.error('Error creating service:', error);
            res.status(500).json({ error: 'An error occurred while creating the service' });
        }
    });
};

//update

// Update a service
const updateService = async (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ error: 'File upload error' });
        } else if (err) {
            return res.status(500).json({ error: 'Unknown error occurred during file upload' });
        }

        const { serv_Id, serv_Code, serv_Name, serv_Description, servType_Id, company_Id, altered_By } = req.body;

        // Use the new image if provided, otherwise keep the existing image path
        const imagePath = req.file ? req.file.filename : req.body.imagefile || undefined;

        try {
            // Call service model to update the service
            await serviceModel.updateService({
                serv_Id: serv_Id || undefined,
                serv_Code: serv_Code || undefined,
                serv_Name: serv_Name || undefined,
                serv_Description: serv_Description || undefined,
                servType_Id: servType_Id || undefined,
                company_Id: company_Id || undefined,
                imagefile: imagePath, // Only pass if provided
                altered_By: altered_By || undefined
            });

            res.status(200).json({ message: 'Service updated successfully' });
        } catch (error) {
            console.error('Error updating service:', error);
            res.status(500).json({ error: 'An error occurred while updating the service' });
        }
    });
};


//delete services

const deleteService = async (req, res) => {
    const { serv_Id } = req.params; // Assuming service ID is passed in params

    try {
        await serviceModel.deleteService(serv_Id);
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: 'An error occurred while deleting the service' });
    }
};

//get all services
const getAllServices = async (req, res) => {
    try {
        const services = await serviceModel.getAllServices();
        res.status(200).json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'An error occurred while fetching services' });
    }
};

//getServicesByCompanyId  
const getServicesByCompanyId = async (req, res) => {
    const { company_Id } = req.params; // Assuming company_Id is passed in params

    try {
        const services = await serviceModel.getServicesByCompanyId(company_Id);
        res.status(200).json(services);
    } catch (error) {
        console.error('Error fetching services by company ID:', error);
        res.status(500).json({ error: 'An error occurred while fetching services' });
    }
};


module.exports = {
    createService,
    getServicesByCompanyId,
    getAllServices,
    updateService,
    deleteService
};
