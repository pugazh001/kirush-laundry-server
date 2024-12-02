const fs = require('fs');
const path = require('path');
const multer = require('multer');
const  serviceSubTypeModel =require("../../../models/admin/mobileapi/product")
const { sql, poolPromise } = require('../../../db');
// Configure multer for file upload


// Function to convert base64 image and save it to the server
function saveBase64Image(base64Image, filePath) {
    // Split the base64 string into header and data
    const matches = base64Image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        return null;
    }

    const imageBuffer = Buffer.from(matches[2], 'base64');
    fs.writeFileSync(filePath, imageBuffer);
    return filePath;
}

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

const addServiceSubTypeMobile= async (req, res) => {
    try {
        const data = req.body;

        let imagePath = null;
        if (data.imagefile) {
            // Save the base64 image to the server
            const fileName = Date.now() + '.jpg'; // You can change the extension based on your file type
            const filePath = path.join(__dirname, 'uploads/product-images/', fileName);

            imagePath = saveBase64Image(data.imagefile, filePath);
        }

        // Fetch the serv_Id based on the company_Id and service name
        const serv_Id = await getServiceId(data.company_Id, data.serv_Name);
        if (!serv_Id) {
            return res.status(404).json({ message: 'Service not found for the given company and service name.' });
        }

        // Add the service subtype with the image path and retrieved serv_Id
        const result = await serviceSubTypeModel.addServiceSubTypeMobile({
            ...data,
            serv_Id,
            imagefile: imagePath || null,
        });

        res.status(201).json({ message: 'Service Subtype added successfully', rowsAffected: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = {addServiceSubTypeMobile}