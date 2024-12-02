// controllers/adminController.js
const adminModel = require('../../models/superadmin/adminModel');

// Create Admin
const createAdmin = async (req, res) => {
  const { username, usercode,  companyName, mobileId, email } = req.body;

  try {
    // Insert company details and get company_Id
    const company_Id = await adminModel.addCompany(companyName, email, mobileId);

    // Insert user details with the company_Id
    await adminModel.addUser(username, usercode,  company_Id,mobileId,email);

    // Success response
    res.status(200).json({ message: 'Admin created successfully',company_Id });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'An error occurred while creating the admin' });
  }
};

module.exports = { createAdmin };
