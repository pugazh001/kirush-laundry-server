// routes/adminRoutes.js
const express = require('express');
const adminController = require('../controllers/superadmin/adminController');
const router = express.Router();

// Route to handle the creation of an admin
router.post('/create-admin', adminController.createAdmin);

module.exports = router;
