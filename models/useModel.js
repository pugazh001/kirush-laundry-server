const { sql, poolPromise } = require('../db');

// Function to get users from the database
const getUsers = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM user_Master');
    return result.recordset;
};

// Function to add a new user to the database
// models/userModel.js

// Function to add a new user to the database without using stored procedure
// const addUser = async (user) => {
//     try {
//         const pool = await poolPromise;
//         const query = `
//             INSERT INTO [user_Master] 
//             (
//                 [user_Name], [mobile_Number], [alter_Mobile_number], 
//                 [email_ID], [user_Type_ID], [active_Flag], [created_By], [created_Date]
//             )
//             VALUES 
//             (
//                 @name, @mobileNumber, @alterMobileNumber, 
//                 @email, @userTypeId, @activeFlag, @createdBy, GETDATE()
//             )
//         `;

//         await pool.request()
//             .input('name', sql.NVarChar, user.name)
//             .input('mobileNumber', sql.NVarChar, user.phoneNumber)
//             .input('alterMobileNumber', sql.NVarChar, user.alternativePhoneNumber)
//             .input('email', sql.NVarChar, user.email)
//             .input('userTypeId', sql.Numeric, user.userTypeId) // Map your user_Type_ID
//             .input('activeFlag', sql.Bit, user.flag)
//             .input('createdBy', sql.NVarChar, user.createdBy)
//             .query(query);

//         console.log('User added successfully');
//     } catch (error) {
//         console.error('Error adding user:', error.message);
//         throw error;
//     }
// };

const addUserAndAddress = async (user) => { 
  const pool = await poolPromise;

  try {
      // Begin a transaction
      const transaction = new sql.Transaction(pool);
      await transaction.begin();

      const userTypeId = user.userTypeId ? user.userTypeId : 5;

      // Get the maximum user ID or count to generate the userCode
      const countResult = await transaction.request()
          .query('SELECT COUNT(*) AS count FROM [user_Master]');

      const count = countResult.recordset[0].count;
      const helper = count < 10 ? `00${count + 1}` : count < 100 ? `0${count + 1}` : `${count + 1}`;
      const date = new Date();
      const userCode = `GUEST${date.getFullYear()}${helper}`;

      // Insert user details into user_Master
      const userInsertQuery = `
          INSERT INTO [user_Master] 
          ([user_Name], [mobile_Number], [alter_Mobile_number], 
          [email_ID], [user_Type_ID], [active_Flag], [created_By], [created_Date],[user_Code])
          VALUES 
          (@name, @mobileNumber, @alterMobileNumber, 
          @email, @userTypeId, @activeFlag, @createdBy, GETDATE(), @userCode);
          SELECT SCOPE_IDENTITY() AS userCode, 
                 [user_Type_ID], 
                 [company_Id], 
                 [deliveryman_id], 
                 [user_Code]
          FROM [user_Master]
          WHERE [user_ID] = SCOPE_IDENTITY();
      `;
      
      const userResult = await transaction.request()
          .input('name', sql.NVarChar, user.name)
          .input('mobileNumber', sql.NVarChar, user.phoneNumber)
          .input('alterMobileNumber', sql.NVarChar, user.alternativePhoneNumber)
          .input('email', sql.NVarChar, user.email)
          .input('userTypeId', sql.Numeric, userTypeId)
          .input('activeFlag', sql.Bit, user.flag)
          .input('createdBy', sql.NVarChar, user.createdBy)
          .input('userCode', sql.NVarChar, userCode)
          .query(userInsertQuery);

      const newUserId = userResult.recordset[0].user_ID;
      const userType = userResult.recordset[0].user_Type_ID;
      const companyId = userResult.recordset[0].company_Id;
      const deliverymanId = userResult.recordset[0].deliveryman_id;
      const newAddressId = 1;
      const active_Flag=1;
      const longitude = user.location.longitude || 0;
        const latitude =user.location.latitude || 0;
         const addresss=user.address || "address-null"
      // Insert address details into user_Address
      if (user.city ) {
      const addressInsertQuery = `
          INSERT INTO [user_Address] 
          ([user_ID], [longitude], [lattitude], [address], [state_Id], [city_Id], 
          [location_Id],[AddressId], [Area], [Street], [Floor_Door_no], [Landmark], [pin_Code], 
          [active_Flag],[mobile_number],[created_By], [created_Date])
          VALUES 
          (@userId, @longitude, @latitude, @address, @stateId, @cityId, 
          @locationId,@addressId, @area, @street, @floorDoorNo, @landmark, @pinCode, 
          @activeFlag, @mobileNumber,@createdBy, GETDATE());
      `;

      await transaction.request()
          .input('userId', sql.NVarChar, userCode)  // Make sure to use sql.Numeric or the correct type for userId
          .input('longitude', sql.Float, longitude)
          .input('latitude', sql.Float, latitude)
          .input('address', sql.NVarChar, addresss)
          .input('stateId', sql.VarChar, user.state)
          .input('cityId', sql.VarChar, user.city)
          .input('locationId', sql.VarChar, user.country)
          .input('addressId', sql.Int, newAddressId)
          .input('area', sql.VarChar, user.area)
          .input('street', sql.VarChar, user.street)
          .input('floorDoorNo', sql.VarChar, user.floorDoorNumber)
          .input('landmark', sql.VarChar, user.landmark)
          .input('pinCode', sql.VarChar, user.pinCode)
          .input('activeFlag', sql.Bit, active_Flag)
          .input('mobileNumber', sql.NVarChar, user.phoneNumber)
         
          .input('createdBy', sql.NVarChar, user.createdBy)
       
          // Make sure createdBy is the correct type
          .query(addressInsertQuery);
      }
      // Commit the transaction
      await transaction.commit();

      // Return user details
      return {  userID:userCode,user_type: userType, company_Id:companyId, deliveryman_id:deliverymanId };

  } catch (error) {
      console.error('Error adding user and address:', error.message);
      throw error;
  }
};


// // Function to find a user by email
// const findUserByEmail = async (email) => {
//     const pool = await poolPromise;
//     const result = await pool.request()
//         .input('email', sql.VarChar, email)
//         .query('SELECT * FROM user_Master WHERE email_ID = @email');
    
//     return result.recordset.length > 0 ? result.recordset[0] : null;
// };
// Function to find a user by email
const findUserByEmail = async (email) => {
    const pool = await poolPromise;
    
    try {
        const result = await pool.request()
            .input('email', sql.NVarChar(50), email)  // Use NVarChar to match the table column type
            .query('SELECT * FROM user_Master WHERE email_ID = @email');

        // Return the user object if found, otherwise return null
        return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
        console.error('Error finding user by email:', error);
        throw error;
    }
};
const getUserById=async(userID) =>{
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userID', userID)
      .query('SELECT * FROM user_Master WHERE user_Code = @userID');
    return result.recordset[0];
  }

 const updateUser=async(userID, userData)=> {
    const pool = await poolPromise;
    const query = `UPDATE users SET name = @name, phoneNumber = @phoneNumber, alternativephoneNumber = @alternativephoneNumber, email = @email, pinCode = @pinCode, landmark = @landmark, country = @country, state = @state, city = @city, area = @area, street = @street, floorDoorNumber = @floorDoorNumber 
                   WHERE userID = @userID`;
    return pool.request()
      .input('userID', userID)
      .input('name', userData.name)
      .input('phoneNumber', userData.phoneNumber)
      .input('alternativephoneNumber', userData.alternativephoneNumber)
      .input('email', userData.email)
      .input('pinCode', userData.pinCode)
      .input('landmark', userData.landmark)
      .input('country', userData.country)
      .input('state', userData.state)
      .input('city', userData.city)
      .input('area', userData.area)
      .input('street', userData.street)
      .input('floorDoorNumber', userData.floorDoorNumber)
      .query(query);
  }

  const deleteUser=async(userID) =>{
    const pool = await poolPromise;
    return pool.request()
      .input('userID', userID)
      .query('DELETE FROM users WHERE userID = @userID');
  }


// Function to add to wishlist
// const addToWishlist = async (userId, servSubType_Id) => {
//     const pool = await poolPromise;

//     // Check if the item is already in the wishlist
//     let result = await pool.request()
//         .input('user_Code', sql.NVarChar, userId)
//         .input('servSubType_Id', sql.Numeric, servSubType_Id)
//         .query('SELECT * FROM Wishlist WHERE user_Code = @user_Code AND servSubType_Id = @servSubType_Id');

//     if (result.recordset.length > 0) {
//         // Update flag to 1
//         await pool.request()
//             .input('user_Code',sql.NVarChar, userId)
//             .input('servSubType_Id', sql.Numeric, servSubType_Id)
//             .query('UPDATE Wishlist SET flag = 1 WHERE user_Code = @user_Code AND servSubType_Id = @servSubType_Id');
//     } else {
//         // Insert new record
//         await pool.request()
//             .input('user_Code', sql.NVarChar, userId)
//             .input('servSubType_Id',sql.Numeric, servSubType_Id)
//             .query('INSERT INTO Wishlist (user_Code, servSubType_Id, flag) VALUES (@user_Code, @servSubType_Id, 1)');
//     }
// };
const addToWishlist = async (userId, servSubType_Id) => {
  const pool = await poolPromise;

  // Step 1: Retrieve additional details from the serviceSubType_Master table
  const serviceDetails = await pool.request()
      .input('servSubType_Id', sql.Numeric, servSubType_Id)
      .query('SELECT servSubType_Name, serv_Name, imagefile, rate FROM serviceSubType_Master WHERE servSubType_Id = @servSubType_Id');

  if (serviceDetails.recordset.length === 0) {
      throw new Error('Service subtype not found.');
  }

  const { servSubType_Name, serv_Name, imagefile, rate } = serviceDetails.recordset[0];

  // Step 2: Check if the item is already in the wishlist
  const result = await pool.request()
      .input('user_Code', sql.NVarChar, userId)
      .input('servSubType_Id', sql.Numeric, servSubType_Id)
      .query('SELECT * FROM Wishlist WHERE user_Code = @user_Code AND servSubType_Id = @servSubType_Id');

  if (result.recordset.length > 0) {
      // Step 3a: Update the existing wishlist item to set the flag to 1
      await pool.request()
          .input('user_Code', sql.NVarChar, userId)
          .input('servSubType_Id', sql.Numeric, servSubType_Id)
          .query('UPDATE Wishlist SET flag = 1 WHERE user_Code = @user_Code AND servSubType_Id = @servSubType_Id');
  } else {
      // Step 3b: Insert a new record into the wishlist with additional details
      await pool.request()
          .input('user_Code', sql.NVarChar, userId)
          .input('servSubType_Id', sql.Numeric, servSubType_Id)
          .input('servSubType_Name', sql.NVarChar, servSubType_Name)
          .input('serv_Name', sql.NVarChar, serv_Name)
          .input('imagefile', sql.NVarChar, imagefile)
          .input('rate', sql.Numeric, rate)
          .query(`INSERT INTO Wishlist (user_Code, servSubType_Id, servSubType_Name, serv_Name, imagefile, rate, flag)
                  VALUES (@user_Code, @servSubType_Id, @servSubType_Name, @serv_Name, @imagefile, @rate, 1)`);
  }
};

// Function to remove from wishlist
const removeFromWishlist = async (userId, servSubType_Id) => {
    const pool = await poolPromise;
    
    // Update flag to 0
    await pool.request()
        .input('user_Code',sql.NVarChar, userId)
        .input('servSubType_Id', sql.Numeric, servSubType_Id)
        .query('UPDATE Wishlist SET flag = 0 WHERE user_Code = @user_Code AND servSubType_Id = @servSubType_Id');
};

// Function to get wishlist items
const getWishlistItems = async (userId) => {
    const pool = await poolPromise;
    
    const result = await pool.request()
        .input('user_Code', sql.NVarChar, userId)
        .query('SELECT * FROM Wishlist WHERE user_Code = @user_Code AND flag = 1');

    return result.recordset;
};

// Function to insert an order into the Orders table and return the order ID
async function createOrder(userId, addressId, totalPrice,total_quntity,payment) {
    try {
      const pool = await poolPromise; // Connect to the database using the connection pool
      
      // Create a new SQL request
      const orderRequest = pool.request();
      
      // Execute the insert query and get the new order ID
      const orderResult = await orderRequest
        .input('user_id', sql.NVarChar, userId)
        .input('AddressId', sql.Int, addressId)
        .input('total_price', sql.Float, totalPrice)
        .input('total_quntity', sql.Int, total_quntity)
        .input('payment', sql.NVarChar, payment)
        .query(
          `INSERT INTO Orders (user_Code, AddressId, total_price, total_item,order_date,payment)
           OUTPUT INSERTED.order_id
           VALUES (@user_id, @AddressId, @total_price,@total_quntity, GETDATE(),@payment)`
        );
  
      // Return the newly created order ID
      return orderResult.recordset[0].order_id;
  
    } catch (error) {
      throw new Error('Error creating order: ' + error.message);
    }
  }
  
  // Function to insert items into the OrderItems table
  async function createOrderItems(orderId, cartItems) {
    try {
      const pool = await poolPromise;
  
      for (let item of cartItems) {
        const itemTotalPrice = item.rate * item.quantity;
  
        const itemRequest = pool.request() // Create a new request for each item
          .input('order_id', sql.Int, orderId)
          .input('product_name', sql.NVarChar, item.servSubType_Name)
          .input('quantity', sql.Int, item.quantity)
          .input('rate', sql.Float, item.rate)
          .input('total_price', sql.Float, itemTotalPrice)
          .input('category_name',sql.NVarChar,item.serv_Name);
  
        await itemRequest.query(
          `INSERT INTO OrderItems (order_id, product_name, quantity, rate, total_price,category_name)
           VALUES (@order_id, @product_name, @quantity, @rate, @total_price,@category_name)`
        );
      }
    } catch (error) {
      throw new Error('Error inserting order items: ' + error.message);
    }
  }
  // Function to add a new address for a user
const addAddress = async (userId, country, state, city, area, street, floorDoorNumber, landmark, pinCode, addressType,location,phoneNumber,address) => {
  const pool = await poolPromise;

  try {
      // Get the maximum addressId for the user
      let result = await pool.request()
          .input('userId', sql.NVarChar, userId)
          .query('SELECT MAX(addressId) AS maxAddressId FROM user_Address WHERE user_ID = @userId');

      // Calculate the new addressId
      const maxAddressId = result.recordset[0].maxAddressId;
      const newAddressId = maxAddressId ? maxAddressId + 1 : 1;

        // Set longitude and latitude to 0 if they are empty or undefined
        const longitude = location.longitude || 0;
        const latitude = location.latitude || 0;
        const addresss=address || "address-null"
     console.log(location.longitude);
     console.log(location.latitude);
     
     
      // Insert the new address record
      await pool.request()
          .input('addressId', sql.Int, newAddressId)
          .input('userId', sql.NVarChar, userId)
          .input('country', sql.VarChar, country)
          .input('longitude', sql.Float, longitude)
          .input('latitude', sql.Float, latitude)
          .input('state', sql.VarChar, state)
          .input('city', sql.VarChar, city)
          .input('area', sql.VarChar, area)
          .input('street', sql.VarChar, street)
          .input('floorDoorNumber', sql.VarChar, floorDoorNumber)
          .input('landmark', sql.VarChar, landmark)
          .input('pinCode', sql.VarChar, pinCode)
          .input('addressType', sql.NVarChar, addressType)
          .input('address', sql.NVarChar, addresss)
          .input('mobile_number',sql.NVarChar,phoneNumber)
          .query(`INSERT INTO user_Address 
                  (addressId, user_ID, location_Id,longitude, lattitude,state_Id, city_Id, Area, Street, Floor_Door_no, Landmark, pin_Code, AddressType,address,mobile_number) 
                  VALUES 
                  (@addressId, @userId, @country,@longitude,@latitude, @state, @city, @area, @street, @floorDoorNumber, @landmark, @pinCode, @addressType,@address,@mobile_number)`);

      console.log('Address added successfully');
  } catch (error) {
      console.error('Error adding address:', error);
      throw new Error('Unable to add address');
  }
};

const updateAddress = async (addressId, userId, country, state, city, area, street, floorDoorNumber, landmark, pinCode, addressType, location, phoneNumber, address) => {
  const pool = await poolPromise;

  try {
      // Set longitude and latitude to 0 if they are empty or undefined
      const longitude = location?.longitude || 0;
      const latitude = location?.latitude || 0;
      const addresss = address || "address-null";

      // Update the existing address record
      await pool.request()
          .input('addressId', sql.Int, addressId)
          .input('userId', sql.NVarChar, userId)
          .input('country', sql.VarChar, country)
          .input('longitude', sql.Float, longitude)
          .input('latitude', sql.Float, latitude)
          .input('state', sql.VarChar, state)
          .input('city', sql.VarChar, city)
          .input('area', sql.VarChar, area)
          .input('street', sql.VarChar, street)
          .input('floorDoorNumber', sql.VarChar, floorDoorNumber)
          .input('landmark', sql.VarChar, landmark)
          .input('pinCode', sql.VarChar, pinCode)
          .input('addressType', sql.NVarChar, addressType)
          .input('address', sql.NVarChar, addresss)
          .input('mobile_number', sql.NVarChar, phoneNumber)
          .query(`UPDATE user_Address 
                  SET location_Id = @country, longitude = @longitude, lattitude = @latitude, state_Id = @state, city_Id = @city,
                      Area = @area, Street = @street, Floor_Door_no = @floorDoorNumber, Landmark = @landmark, 
                      pin_Code = @pinCode, AddressType = @addressType, address = @address, mobile_number = @mobile_number
                  WHERE AddressId = @addressId AND user_ID = @userId`);

      console.log('Address updated sk successfully');
  } catch (error) {
      console.error('Error updating address:', error);
      throw new Error('Unable to update address');
  }
};

const getAddressByUserId = async (userId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('userId', sql.NVarChar, userId)
    .query('SELECT * FROM user_Address WHERE user_ID = @userId AND active_Flag=1');
  return result.recordset;
};

// const updateAddress = async (userId, addressId, addressData) => {
//   const pool = await poolPromise;
//   const result = await pool.request()
//     .input('userId', sql.NVarChar, userId)
//     .input('addressId', sql.Int, addressId)
//     .input('country', sql.NVarChar, addressData.country)
//     .input('state', sql.NVarChar, addressData.state)
//     .input('city', sql.NVarChar, addressData.city)
//     .input('area', sql.NVarChar, addressData.area)
//     .input('street', sql.NVarChar, addressData.street)
//     .input('floorDoorNumber', sql.NVarChar, addressData.floorDoorNumber)
//     .input('landmark', sql.NVarChar, addressData.landmark)
//     .input('pinCode', sql.NVarChar, addressData.pinCode)
//     .input('addressType', sql.NVarChar, addressData.addressType)
//     .query(`
//       UPDATE user_Address
//       SET country = @country,
//           state = @state,
//           city = @city,
//           area = @area,
//           street = @street,
//           floorDoorNumber = @floorDoorNumber,
//           landmark = @landmark,
//           pinCode = @pinCode,
//           addressType = @addressType
//       WHERE user_Code = @userId AND addressId = @addressId
//     `);
//   return result.rowsAffected[0];
// };
  // Get all orders
const getAllOrders=async()=> {
  try {
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT * FROM orders');
      return result.recordset;
  } catch (error) {
      throw error;
  }
}
 // Get order by ID
 const getOrderById=async(order_id) =>{
  try {
      const pool = await poolPromise;
      const result = await pool.request()
          .input('order_id', sql.Int, order_id)
          .query('SELECT * FROM orders WHERE order_id = @order_id');
      return result.recordset[0];
  } catch (error) {
      throw error;
  }
}

// Update order status
const updateOrderStatus=async(order_id, orderStatus_Id)=> {
  try {
      const pool = await poolPromise;
      const result = await pool.request()
          .input('order_id', sql.Int, order_id)
          .input('orderStatus_Id', sql.Int, orderStatus_Id)
          .query('UPDATE orders SET orderStatus_Id = @orderStatus_Id WHERE order_id = @order_id');
      return result.rowsAffected;
  } catch (error) {
      throw error;
  }
}

const getOrdersByUser = async (user_Code) => {
  try {
      // Establish connection
      let pool = await poolPromise;

      // Query the database for orders of a specific user
      let result = await pool.request()
          .input('user_Code', sql.NVarChar, user_Code)
          .query(`SELECT order_id, user_Code, total_price, order_date, AddressId, orderStatus_Id ,payment
                  FROM orders 
                  WHERE user_Code = @user_Code and orderStatus_Id<>7
                   order by
				  order_id desc
                  `);

      return result.recordset;  // Return the orders
  } catch (error) {
      throw error;
  }
};



module.exports = { getUsers, addUserAndAddress, findUserByEmail,getUserById, addToWishlist,
    removeFromWishlist,
    getWishlistItems,createOrder,createOrderItems,addAddress,getAddressByUserId,updateAddress,getAllOrders,
    getOrderById,updateOrderStatus,getOrdersByUser,updateAddress};
