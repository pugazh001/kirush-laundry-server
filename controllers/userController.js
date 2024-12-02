// controllers/userController.js
const userModel = require('../models/useModel');
const { poolPromise ,sql} = require('../db'); // Adjust the path as necessary
// Handler to get the list of users
const getUsers = async (req, res) => {
    try {
        const users = await userModel.getUsers();
        res.status(200).json(users); // Respond with JSON data
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
      const userID = req.params.id;
      const user = await userModel.getUserById(userID);
      if (!user) {
        return res.status(404).send('User not found');
      }
      res.json(user);
    } catch (error) {
      res.status(500).send('Error fetching user: ' + error.message);
    }
  };

  const updateUser = async (req, res) => {
    try {
      const userID = req.params.id;
      const userData = req.body;
      await User.updateUser(userID, userData);
      res.send('User updated successfully');
    } catch (error) {
      res.status(500).send('Error updating user: ' + error.message);
    }
  };
  
  const deleteUser = async (req, res) => {
    try {
      const userID = req.params.id;
      await User.deleteUser(userID);
      res.send('User deleted successfully');
    } catch (error) {
      res.status(500).send('Error deleting user: ' + error.message);
    }
  };
  
// Handler to add a new user
// const addUser = async (req, res) => {
//     try {
//         const user = req.body;

//         // Check if the email already exists
//         const existingUser = await userModel.findUserByEmail(user.email);
//         if (existingUser) {
//             return res.status(400).json({ message: 'Email already exists' });
//         }

//         // Add the user to the database if the email is not found
//         await userModel.addUser(user);
//         res.status(201).json({ message: 'User added successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error adding user', error: error.message });
//         console.log(error);
        
//     }
  
// };
const addUserAndAddress = async (req, res) => {
    try {
        const user  = req.body;
        console.log(user);
        console.log(user.location.latitude);
        console.log(user.location.longitude);
        
        // Check if the email already exists
        const existingUser = await userModel.findUserByEmail(user.email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Add the user and their address to the database
        const result = await userModel.addUserAndAddress(user);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error adding user and address', error: error.message });
        console.log(error);
        
    }
};

//wishlist 


// Add to wishlist
const addToWishlist = async (req, res) => {
  const { userId, servSubType_Id } = req.body;

  try {
      await userModel.addToWishlist(userId, servSubType_Id);
      res.status(200).send('Added to wishlist');
  } catch (error) {
      res.status(500).send('Error adding to wishlist: ' + error.message);
  }
};

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
  const { userId, servSubType_Id } = req.body;

  try {
      await userModel.removeFromWishlist(userId, servSubType_Id);
      res.status(200).send('Removed from wishlist');
  } catch (error) {
      res.status(500).send('Error removing from wishlist: ' + error.message);
  }
};

// Get wishlist items
const getWishlistItems = async (req, res) => {
  const { userId } = req.params;

  try {
      const items = await userModel.getWishlistItems(userId);
      res.status(200).json(items);
  } catch (error) {
      res.status(500).send('Error fetching wishlist items: ' + error.message);
  }
};

// order items 

//const { createOrder, createOrderItems } = require('../models/orderModel');

async function placeOrder(req, res) {
  const { cartItems, totalPrice, addressId, userId,totalquantity ,payment} = req.body; // userId is now received from the frontend
  console.log(addressId);
  console.log(cartItems);
  
  try {
    // Create a new order
    const orderId = await userModel.createOrder(userId, addressId, totalPrice,totalquantity,payment);
    
    // Create order items associated with the order
    await userModel.createOrderItems(orderId, cartItems);

    res.status(201).json({ message: 'Order placed successfully', orderId });
  } catch (error) {
    console.error('Order placement error:', error);
    res.status(500).json({ error: 'Order placement failed: ' + error.message });
  }
}



const addNewAddressController = async (req, res) => {
    const { userId, country, state, city, area, street, floorDoorNumber, landmark, pinCode, addressType ,location,phoneNumber,address} = req.body;

    try {
        await userModel.addAddress(userId, country, state, city, area, street, floorDoorNumber, landmark, pinCode, addressType,location,phoneNumber,address);
        res.status(201).json({ message: 'Address added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add address', error: error.message });
        console.error('Error adding address:', error); // Log the full error
        throw new Error('Unable to add address');
    }
};


//update address
const updateAddressController = async (req, res) => {
  const { addressId, userId, country, state, city, area, street, floorDoorNumber, landmark, pinCode, addressType, location, phoneNumber, address } = req.body;

   console.log( addressId, userId, country, state, city, area, street, floorDoorNumber, landmark, pinCode, addressType, location, phoneNumber, address);
   
  try {
      await userModel.updateAddress(addressId, userId, country, state, city, area, street, floorDoorNumber, landmark, pinCode, addressType, location, phoneNumber, address);
      res.status(200).json({ message: 'Address updated successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Failed to update address', error: error.message });
      console.error('Error updating address:', error); // Log the full error
  }
};

//delete 

const deleteAddress = async (req, res) => {
  const { userId, addressId } = req.params;

  const query = `
      UPDATE user_Address
      SET active_Flag = 0
      WHERE user_ID = @userId AND AddressId = @addressId
  `;

  try {

    const pool = await poolPromise;
    
      const result = await pool.request()
          .input('userId', sql.NVarChar, userId) // Change data type according to your schema
          .input('addressId', sql.Int, addressId) // Change data type according to your schema
          .query(query);

      if (result.rowsAffected[0] > 0) {
          res.status(200).json({ message: 'Address deactivated successfully.' });
      } else {
          res.status(404).json({ message: 'Address not found or already inactive.' });
      }
  } catch (error) {
      console.error('Error deactivating address:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};
// Function to get address by user ID
const getAddressByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const addresses = await userModel.getAddressByUserId(userId);

    if (addresses.length > 0) {
      res.status(200).json(addresses);
    } else {
      res.status(404).json({ message: 'No address found for this user' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Function to update an address for a particular user
const updateAddress = async (req, res) => {
  const { userId } = req.params;
  const { addressId } = req.body;

  try {
    const updatedCount = await userModel.updateAddress(userId, addressId, req.body);

    if (updatedCount > 0) {
      res.status(200).json({ message: 'Address updated successfully' });
    } else {
      res.status(404).json({ message: 'Address not found for this user' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};



// Get all orders
const getAllOrders = async (req, res) => {
  try {
      const orders = await userModel.getAllOrders();
      res.status(200).json(orders);
  } catch (error) {
      res.status(500).json({ message: 'Error retrieving orders', error });
  }
};

// Get a specific order by ID
const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
      const order = await userModel.getOrderById(id);
      if (order) {
          res.status(200).json(order);
      } else {
          res.status(404).json({ message: 'Order not found' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Error retrieving order', error });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { orderStatus_Id } = req.body;
  try {
      const rowsAffected = await userModel.updateOrderStatus(id, orderStatus_Id);
      if (rowsAffected > 0) {
          res.status(200).json({ message: 'Order status updated successfully' });
      } else {
          res.status(404).json({ message: 'Order not found' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Error updating order status', error });
  }
};


// Controller function to handle getting all orders for a specific user
const getUserOrders = async (req, res) => {
  try {
      const { user_Code } = req.params; // Get user_Code from the URL parameters

      // Call the model function to fetch orders
      const orders = await userModel.getOrdersByUser(user_Code);

      // Return orders in the response
      if (orders.length > 0) {
          res.status(200).json({
              success: true,
              data: orders
          });
      } else {
          res.status(404).json({
              success: false,
              message: 'No orders found for this user'
          });
      }
  } catch (error) {
      res.status(500).json({
          success: false,
          message: 'Server error',
          error: error.message
      });
  }
};

const getOrderDetails = async (req, res) => {
  const { orderId } = req.params; // Get order ID from the request parameters
  try {
      const pool = await poolPromise; // Wait for the pool promise
      const orderQuery = `
           Select O.*,UA.*,d.* from Orders O

		  LEFT JOIN user_Address UA ON UA.user_ID=O.user_Code AND UA.AddressId=O.AddressId
		  LEFT JOIN deliveryman d ON O.deliveryman_id = d.deliveryman_id
		  Where O.order_id= @OrderId;
      `;
      
      // Create a request from the pool and add parameters
      const request = pool.request();
      request.input('OrderId', sql.Int, orderId); // Set the parameter type

      const orderResult = await request.query(orderQuery);
      
      // Get products for the order
      const productsQuery = `
          SELECT * FROM orderitems WHERE order_id = @OrderId;
      `;
      
      const productsResult = await request.query(productsQuery); // No need to create a new request, just use the same
      
      res.status(200).json({
          success: true,
          data: { order: orderResult.recordset[0], products: productsResult.recordset }
      });
  } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching order details', error });
      console.log(error);
      
  }
};
const cancelorder=async(req,res)=>{
  const { orderId } = req.params;

  try {
    const pool = await poolPromise;
    const request = new sql.Request(pool);

    // Update the orderStatus_Id to 6 (cancelled)
    await request
      .input('orderId', sql.Int, orderId)
      .query('UPDATE Orders SET orderStatus_Id = 7 WHERE order_id = @orderId');

    return res.status(200).json({ message: 'Order canceled successfully' });
  } catch (error) {
    console.error('Error canceling the order:', error);
    return res.status(500).json({ message: 'Failed to cancel the order' });
  }

}


module.exports = { getUsers, addUserAndAddress ,getUserById,deleteUser,
  updateUser,removeFromWishlist,addToWishlist,getWishlistItems,placeOrder,
  addNewAddressController,addNewAddressController,getAddressByUserId,updateAddress,
  getAllOrders,getOrderById,updateOrderStatus,getUserOrders,getOrderDetails,cancelorder,updateAddressController,deleteAddress};
