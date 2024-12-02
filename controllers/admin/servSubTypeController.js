// controllers/servSubTypeController.js
const serviceSubTypeModel = require('../../models/admin/servSubTypeModel');
const multer = require('multer');
const path = require('path');
const { sql, poolPromise } = require('../../db');
const { log } = require('console');
// Get all service subtypes
const getAllServiceSubTypes = async (req, res) => {
    try {
        const subtypes = await serviceSubTypeModel.getAllServiceSubTypes();
        res.json(subtypes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single service subtype by ID
const getServiceSubTypeById = async (req, res) => {
    try {
        const id = req.params.id;
        const subtype = await serviceSubTypeModel.getServiceSubTypeById(id);
        if (!subtype) {
            return res.status(404).json({ message: 'Service Subtype not found' });
        }
        res.json(subtype);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new service subtype
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/product-images'); // Directory where the images will be stored
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Generates a unique filename
    }
});

const upload = multer({ storage: storage }).single('imagefile');


const getServiceId = async (company_Id, serv_Name) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('company_Id', sql.Numeric, company_Id)
            .input('serv_Name', sql.NVarChar(255), serv_Name)
            .query(`
                SELECT serv_Id
                FROM service_Master
                WHERE company_Id = @company_Id AND serv_Name = @serv_Name
            `);
        return result.recordset[0]?.serv_Id;
    } catch (error) {
        throw new Error(`Database Error: ${error.message}`);
    }
};

const addServiceSubType = async (req, res) => {
    try {
        // First, upload the image
        upload(req, res, async function (err) {
            if (err) {
                return res.status(500).json({ message: 'File upload error', error: err });
            }

            // Image uploaded successfully, now proceed to database insert
            const data = req.body;
       console.log(data);
       
            // Store  the image path if the image was uploaded
            const imagePath = req.file ? `${req.file.filename}` : null;

            // Fetch the serv_Id
            const serv_Id = await getServiceId(data.company_Id, data.serv_Name);
            if (!serv_Id) {
                return res.status(404).json({ message: 'Service not found for the given company and service name.' });
            }

            // Add the service subtype with the image path and retrieved serv_Id
            const result = await serviceSubTypeModel.addServiceSubType({ 
                ...data, 
                serv_Id, 
                imagefile: imagePath 
            });

            res.status(201).json({ message: 'Service Subtype added successfully', rowsAffected: result });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// const updateServiceSubType = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const data = req.body;
//         console.log(data);
        
//         const result = await serviceSubTypeModel.updateServiceSubType(id, data);
//         if (result === 0) {
//             return res.status(404).json({ message: 'Service Subtype not found' });
//         }
//         res.json({ message: 'Service Subtype updated successfully', rowsAffected: result });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
// const updateServiceSubType = async (req, res) => { 
//     try {
//         const id = req.params.id;
//         const data = req.body;
//         console.log('Incoming data:', data.servSubType_Name);  // Log to see the incoming request data
//         console.log('Incoming data:', data.rate);
//         console.log('Incoming data:', data.serv_Name);
//         console.log('Incoming data:', data.imagefile);
//         console.log('Incoming data:', data.company_Id);
//         console.log('Incoming data:', data.rate);
        
//         const result = await serviceSubTypeModel.updateServiceSubType(id, data);
//         if (result === 0) {
//             return res.status(404).json({ message: 'Service Subtype not found' });
//         }
//         res.json({ message: 'Service Subtype updated successfully', rowsAffected: result });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
const updateServiceSubType = async (req, res) => {
    try {
        // First, upload the image if provided
        upload(req, res, async function (err) {
            if (err) {
                return res.status(500).json({ message: 'File upload error', error: err });
            }

            const data = req.body;
            const serviceSubTypeId = req.params.id;  // Assuming you pass the service subtype ID in the URL
             console.log("id",serviceSubTypeId);
             
            console.log(data);
            
            // Store the image path if the image was uploaded
            const imagePath = req.file ? `${req.file.filename}` : null;

            // Check if service exists
            // const serv_Id = await getServiceId(data.company_Id, data.serv_Name);
            // if (!serv_Id) {
            //     return res.status(404).json({ message: 'Service not found for the given company and service name.' });
            // }

            // Prepare data for the update query
            const updateData = {
                ...data,
               
                imagefile: imagePath,  // Image path is optional
            };

            // Update the service subtype
            const result = await serviceSubTypeModel.updateServiceSubType(serviceSubTypeId, updateData);

            if (result > 0) {
                res.status(200).json({ message: 'Service Subtype updated successfully' });
            } else {
                res.status(404).json({ message: 'Service Subtype not found' });
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Delete a service subtype
const deleteServiceSubType = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await serviceSubTypeModel.deleteServiceSubType(id);
        if (result === 0) {
            return res.status(404).json({ message: 'Service Subtype not found' });
        }
        res.json({ message: 'Service Subtype deleted successfully', rowsAffected: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    upload,
    getAllServiceSubTypes,
    getServiceSubTypeById,
    addServiceSubType,
    updateServiceSubType,
    deleteServiceSubType
};
