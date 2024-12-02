// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const otpController = require('../controllers/otpController');

// Route to get the list of users
router.get('/users', userController.getUsers);

// Route to add a new user
router.post('/users', userController.addUserAndAddress);

// Get a user by ID
router.get('/users/:id', userController.getUserById);

// Update a user
router.put('/users/:id', userController.updateUser);

// Delete a user
router.delete('/users/:id', userController.deleteUser);

//otp- verification 
router.post('/request-otp', otpController.requestOtp);


router.post('/verify-otp', otpController.verifyOtp);


// Add to wishlist
router.post('/wishlist/add', userController.addToWishlist);

// Remove from wishlist
router.post('/wishlist/remove', userController.removeFromWishlist);

// Get wishlist items
router.get('/wishlist/:userId', userController.getWishlistItems);


// POST endpoint to place an order
router.post('/orders', userController.placeOrder);

//add Address 
router.post('/addAddress', userController.addNewAddressController);

//edit Address 
router.put('/editAddress', userController.updateAddressController);

//disable Address

router.delete('/disable/address/:userId/:addressId',userController.deleteAddress)

// Route to get addresses by user ID
router.get('/getAddress/:userId', userController.getAddressByUserId);

// Route to update an address
router.put('/updateAddress/:userId', userController.updateAddress);

// Get all orders
router.get('/orders', userController.getAllOrders);

// Get a single order by ID
router.get('/orders/:id', userController.getOrderById);

// Update order status by ID
router.put('/orders/:id/status', userController.updateOrderStatus);

// Route to get all orders for a specific user
router.get('/orders/user/:user_Code', userController.getUserOrders);

router.get('/order-details/:orderId', userController.getOrderDetails);
// Cancel Order API
router.put('/orders/cancel/:orderId',userController.cancelorder)

module.exports = router;
