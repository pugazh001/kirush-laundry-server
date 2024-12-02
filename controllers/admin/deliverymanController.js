const DeliverymanModel = require('../../models/admin/deliverymanModel');
const { poolPromise,sql } = require('../../db');

// Deliveryman Controller
exports.createDeliveryman = async (req, res) => {
    const { user_Name, mobile_Number, email_ID, alternativeNumber, city, address, company_Id } = req.body;

    try {
        // Generate user code
        const user_Code = generateUserCode(); 

        // Use the model to create a deliveryman
        await DeliverymanModel.createDeliveryman(user_Code, user_Name, mobile_Number, email_ID, alternativeNumber, city, address, company_Id);

        res.status(201).json({ message: 'Deliveryman created successfully' });
    } catch (error) {
        console.error(error);
        if (error.message === 'Email already exists') {
            res.status(409).json({ message: error.message }); // Conflict status for existing email
        } else {
            res.status(500).json({ message: 'An error occurred while creating deliveryman' });
        }
    }
};
// Controller to get deliverymen by company_id
 exports.getDeliverymenByCompanyId=async(req, res)=> {
    const { company_id } = req.params;
  
    try {
      const deliverymen = await DeliverymanModel.getDeliverymenByCompanyId(company_id);
      if (!deliverymen || deliverymen.length === 0) {
        return res.status(404).json({ message: 'No deliverymen found for this company' });
      }
      res.status(200).json(deliverymen);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  // Controller to get deliveryman by deliveryman_id
  exports.getDeliverymanById=async(req, res) =>{
    const { deliveryman_id } = req.params;
  
    try {
      const deliveryman = await DeliverymanModel.getDeliverymanById(deliveryman_id);
      if (!deliveryman) {
        return res.status(404).json({ message: 'Deliveryman not found' });
      }
      res.status(200).json(deliveryman);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
// Utility function to generate user code
const generateUserCode = () => {
    return `Anchor${Date.now()}`; // Example: DLM followed by current timestamp
};

// exports.assignDeliveryman = async (req, res) => {
//   const { orderId,status_Name, deliverymanIds } = req.body;
//   console.log(status_Name);
  

//     try {
//         const pool = await poolPromise; // Use the connection pool

//         // Begin transaction to assign multiple deliverymen
//         const transaction = new sql.Transaction(pool);
//         await transaction.begin();

//         const request = new sql.Request(transaction);

//         // Loop through each deliverymanId and insert the assignment
//         for (const deliverymanId of deliverymanIds) {
//             await request.query(`
//                 INSERT INTO AssignDeliveryman (order_id, deliveryman_id, assign_date, status)
//                 VALUES (${orderId}, ${deliverymanId}, GETDATE(), 'assigned')
//             `);
//         }

//         // Update order status to 2 (Assigned)
//         await request.query(`
//             UPDATE Orders
//             SET orderStatus_Id = 2
//             WHERE order_id = ${orderId}
//         `);

//         // Commit transaction
//         await transaction.commit();

//         res.status(200).json({ message: 'Task assigned to multiple deliverymen successfully.' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'An error occurred while assigning the task.' });
//     }
// };
// exports.assignDeliveryman = async (req, res) => {
//   const { orderId, status_Name, deliverymanIds } = req.body;

//   try {
//     const pool = await poolPromise; // Use the connection pool

//     // Begin transaction to assign multiple deliverymen
//     const transaction = new sql.Transaction(pool);
//     await transaction.begin();

//     const request = new sql.Request(transaction);

//     // Fetch orderStatus_Id from Orders table
    

//     // Conditionally update orderStatus_Id if status_Name is 'Pending'
//     if (status_Name === 'Pending') {
//       await request.query(`
//         UPDATE Orders
//         SET orderStatus_Id = 2
//         WHERE order_id = ${orderId}
//       `);
//     } else {
//       console.log(`Order status not changed as status_Name is '${status_Name}'`);
//     }
//     const result = await request.query(`
//       SELECT orderStatus_Id
//       FROM Orders
//       WHERE order_id = ${orderId}
//     `);

//     const orderStatus_Id = result.recordset[0].orderStatus_Id;
//     // Loop through each deliverymanId and insert the assignment with the current orderStatus_Id
//     for (const deliverymanId of deliverymanIds) {
//       await request.query(`
//         INSERT INTO AssignDeliveryman (order_id, deliveryman_id, assign_date, status, orderStatus_Id)
//         VALUES (${orderId}, ${deliverymanId}, GETDATE(), 'assigned', ${orderStatus_Id})
//       `);
//     }

//     // Commit transaction
//     await transaction.commit();

//     res.status(200).json({ message: 'Task assigned to multiple deliverymen successfully.' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'An error occurred while assigning the task.' });
//   }
// };
exports.assignDeliveryman = async (req, res) => {
  const { orderId, status_Name, deliverymanIds } = req.body;

  try {
    const pool = await poolPromise; // Use the connection pool

    // Begin transaction to assign multiple deliverymen
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    const request = new sql.Request(transaction);

    // Conditionally update orderStatus_Id if status_Name is 'Pending'
    if (status_Name === 'Pending') {
      await request.query(`
        UPDATE Orders
        SET orderStatus_Id = 2
        WHERE order_id = ${orderId}
      `);
    } else {
      console.log(`Order status not changed as status_Name is '${status_Name}'`);
    }

    // Fetch the current orderStatus_Id after the update
    const result = await request.query(`
      SELECT orderStatus_Id
      FROM Orders
      WHERE order_id = ${orderId}
    `);

    const orderStatus_Id = result.recordset[0].orderStatus_Id;

    // Loop through each deliverymanId and check if already assigned
    for (const deliverymanId of deliverymanIds) {
      const checkAssignment = await request.query(`
        SELECT *
        FROM AssignDeliveryman
        WHERE order_id = ${orderId} 
          AND deliveryman_id = ${deliverymanId} 
          AND orderStatus_Id = ${orderStatus_Id}  -- Check for the same orderStatus_Id
      `);

      if (checkAssignment.recordset.length > 0) {
        // If assignment exists, respond with a message and skip the insert

        const deliverymanResult = await request.query(`
          SELECT deliveryman_name
          FROM Deliveryman 
          WHERE deliveryman_id = ${deliverymanId}
        `);
        
        const deliverymanName = deliverymanResult.recordset[0]?.deliveryman_name || 'Unknown Deliveryman';
        
        return res.status(400).json({ message: `Already assigned to  ${deliverymanName} for this order status.` });
      }

      // If not assigned, proceed to insert the assignment
      await request.query(`
        INSERT INTO AssignDeliveryman (order_id, deliveryman_id, assign_date, status, orderStatus_Id)
        VALUES (${orderId}, ${deliverymanId}, GETDATE(), 'assigned', ${orderStatus_Id})
      `);
    }

    // Commit transaction
    await transaction.commit();

    res.status(200).json({ message: 'Task assigned to multiple deliverymen successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while assigning the task.' });
  }
};


// API to fetch orders recommended to a specific deliveryman by the admin
exports.recommendAchor= async (req, res) => {
  const deliverymanId = req.params.deliverymanId;

  try {
      const pool = await poolPromise;

      // SQL query to fetch assigned orders for the specific deliveryman
      const result = await pool.request()
          .input('deliverymanId', sql.Int, deliverymanId)
          .query(`
            SELECT 
                o.order_id,
                o.user_Code,
                o.total_price,
                o.order_date,
                o.orderStatus_Id,
                u.user_Name ,
                COUNT(oi.item_id) AS total_item,
                u.email_Id,
                u.mobile_Number AS customer_phone,
                a.assign_date,
                s.status_Name,
                ua.city_Id, 
                d.deliveryman_name,
                a.status AS assignment_status
            FROM Orders o
            JOIN AssignDeliveryman a ON o.order_id = a.order_id
            JOIN user_Address ua ON ua.user_ID = o.user_Code AND o.AddressId = ua.AddressId
            JOIN order_Status s ON o.orderStatus_Id = s.orderStatus_Id
            JOIN orderItems oi ON o.order_id = oi.order_id
            JOIN user_Master u ON o.user_Code = u.user_Code
            LEFT JOIN deliveryman d ON o.deliveryman_id = d.deliveryman_id
            WHERE a.deliveryman_id = @deliverymanId
            AND o.orderStatus_Id IN (2,4)  
            GROUP BY 
                o.order_id,
                o.user_Code,
                o.total_price,
                o.order_date,
                o.orderStatus_Id,
                u.user_Name,
                u.email_ID,
                u.mobile_Number,
                a.assign_date,
                s.status_Name,
                ua.city_Id, 
                d.deliveryman_name,
                a.status
                ORDER BY 
      O.[order_id] DESC;
        `);
        

      if (result.recordset.length > 0) {
          res.status(200).json(result.recordset);
      } else {
          res.status(404).json({ message: 'No orders found for this deliveryman.' });
      }
  } catch (error) {
      console.error('Error fetching assigned orders:', error);
      res.status(500).json({ message: 'Server error fetching orders.' });
  }
};
// exports.acceptOrder = async (req, res) => {
//   const { orderId, deliverymanId } = req.body;  // Get orderId and deliverymanId from the frontend

//   try {
//     const pool = await poolPromise;
//     const request = new sql.Request(pool);

//     // Start transaction to update order status and insert into OrderHistory
//     const transaction = new sql.Transaction(pool);
//     await transaction.begin();

//     // Fetch the current orderStatus_Id from Orders table
//     const orderResult = await request.query(`
//       SELECT orderStatus_Id 
//       FROM Orders 
//       WHERE order_id = ${orderId}
//     `);

//     const currentOrderStatusId = orderResult.recordset[0].orderStatus_Id;
//     let newOrderStatusId;

//     // Determine the new status based on the current status
//     if (currentOrderStatusId === 4) {
//       newOrderStatusId = 5;  // Change to 5 if current is 4
//     } else {
//       newOrderStatusId = 3;  // Otherwise, change to 3
//     }

//     // Update the Orders table with the new orderStatus_Id and deliverymanId
//     await request.query(`
//       UPDATE Orders
//       SET orderStatus_Id = ${newOrderStatusId}, deliveryman_id = ${deliverymanId}
//       WHERE order_id = ${orderId}
//     `);

//     // Insert a record into OrderHistory table
//     await request.query(`
//       INSERT INTO OrderHistory (order_id, deliveryman_id, orderStatus_Id, changed_at)
//       VALUES (${orderId}, ${deliverymanId}, ${newOrderStatusId}, GETDATE())
//     `);

//     // Commit the transaction
//     await transaction.commit();

//     res.status(200).json({ message: 'Order accepted successfully and status updated.' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'An error occurred while accepting the order.' });
//   }
// };
exports.acceptOrder = async (req, res) => {
  const { orderId, deliverymanId } = req.body;  // Get orderId and deliverymanId from the frontend

  try {
    const pool = await poolPromise;
    const request = new sql.Request(pool);

    // Start transaction to update order status, insert into OrderHistory, and delete from AssignDeliveryman
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Fetch the current orderStatus_Id from Orders table
      const orderResult = await request.query(`
        SELECT orderStatus_Id 
        FROM Orders 
        WHERE order_id = ${orderId}
      `);

      if (orderResult.recordset.length === 0) {
        // If no order with the given orderId exists, return an error
        return res.status(404).json({ message: 'Order not found' });
      }

      const currentOrderStatusId = orderResult.recordset[0].orderStatus_Id;
      let newOrderStatusId;

      // Determine the new status based on the current status
      if (currentOrderStatusId === 4) {
        newOrderStatusId = 5;  // Change to 5 if current is 4
      } else {
        newOrderStatusId = 3;  // Otherwise, change to 3
      }

      // Update the Orders table with the new orderStatus_Id and deliverymanId
      await request.query(`
        UPDATE Orders
        SET orderStatus_Id = ${newOrderStatusId}, deliveryman_id = ${deliverymanId}
        WHERE order_id = ${orderId}
      `);

      // Insert a record into OrderHistory table
      await request.query(`
        INSERT INTO OrderHistory (order_id, deliveryman_id, orderStatus_Id, changed_at)
        VALUES (${orderId}, ${deliverymanId}, ${newOrderStatusId}, GETDATE())
      `);

      // Check if orderId exists in AssignDeliveryman table before attempting to delete
      const assignResult = await request.query(`
        SELECT * FROM AssignDeliveryman 
        WHERE order_id = ${orderId}
      `);

      if (assignResult.recordset.length > 0) {
        // If orderId exists in AssignDeliveryman, proceed with deletion
        await request.query(`
          DELETE FROM AssignDeliveryman 
          WHERE order_id = ${orderId}
        `);
        console.log(`Order ${orderId} deleted from AssignDeliveryman table`);
      } else {
        console.log(`Order ${orderId} does not exist in AssignDeliveryman table, nothing to delete`);
      }

      // Commit the transaction
      await transaction.commit();

      res.status(200).json({ message: 'Order accepted, status updated, and delivery assignment handled.' });
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      console.error('Transaction error:', error);
      res.status(500).json({ message: 'An error occurred while accepting the order.' });
    }
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Failed to connect to the database.' });
  }
};


exports.getAllOrders = async (req, res) => {
  const { deliverymanId } = req.params;  // deliverymanId from the request parameters

  try {
    const pool = await poolPromise;
    const request = new sql.Request(pool);

    // Query for all orders for the deliveryman with flag = 1
    // const result = await request.query(`
    //   SELECT * 
    //   FROM OrderHistory
    //   WHERE deliveryman_id = ${deliverymanId} AND flag = 1
    // `);
    const result = await request.query(`
      

      Select OD.[order_id]
      ,OD.[user_Code]
      ,OD.[total_price]
      ,OD.[order_date]
      ,OD.[payment]
       ,OD.[deliveryman_id]
        ,OD.[orderStatus_Id] AS currentstatus
	  ,OH.[orderStatus_Id]
     ,OH.[changed_at]
	  ,UA.[state_Id]
      ,UA.[city_Id]
      ,UA.[location_Id]
      ,UA.[Area]
      ,UA.[Street]
	  ,UM.user_Name
	  ,UM.mobile_Number
	  ,UM.email_ID
    
     ,OS.status_Name
from 
Orders OD

JOIN [user_Address] UA  ON UA.[user_ID] = OD.[user_Code] AND UA.AddressId = OD.AddressId
JOIN user_Master UM ON OD.user_Code = UM.user_Code
JOIN order_Status OS ON OD.orderStatus_Id=OS.orderStatus_Id
JOIN OrderHistory OH ON OH.order_id = OD.order_id AND OH.deliveryman_id=${deliverymanId} AND flag=1
ORDER BY 
      OD.[order_id] DESC;

      `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error retrieving orders:', error);
    res.status(500).json({ message: 'Error retrieving orders.' });
  }
};

exports.getPickOrders = async (req, res) => {
  const { deliverymanId } = req.params;  // deliverymanId from the request parameters

  try {
    const pool = await poolPromise;
    const request = new sql.Request(pool);

    // Query for pick orders where orderStatus_Id = 3
    const result = await request.query(`
      

      Select OD.[order_id]
            ,OD.[user_Code]
            ,OD.[total_price]
            ,OD.[order_date]
          ,OD.orderStatus_Id
          ,UA.[state_Id]
            ,UA.[city_Id]
            ,UA.[location_Id]
            ,UA.[Area]
            ,UA.[Street]
          ,UM.user_Name
          ,UM.mobile_Number
          ,UM.email_ID
           ,OS.status_Name
      from 
      Orders OD
      JOIN [user_Address] UA  ON UA.[user_ID] = OD.[user_Code] AND UA.AddressId = OD.AddressId
      JOIN user_Master UM ON OD.user_Code = UM.user_Code
      JOIN order_Status OS ON OD.orderStatus_Id=OS.orderStatus_Id
      
      
      Where order_id in (
        SELECT order_id FROM [OrderHistory] WHERE deliveryman_id = ${deliverymanId} AND flag = 1 AND orderStatus_Id = 3)
      
      
            `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error retrieving pick orders:', error);
    res.status(500).json({ message: 'Error retrieving pick orders.' });
  }
};

exports.getDropOrders = async (req, res) => {
  const { deliverymanId } = req.params;  // deliverymanId from the request parameters

  try {
    const pool = await poolPromise;
    const request = new sql.Request(pool);

    // Query for drop orders where orderStatus_Id = 5
    const result = await request.query(`
      

      Select OD.[order_id]
            ,OD.[user_Code]
            ,OD.[total_price]
            ,OD.[order_date]
          ,OD.orderStatus_Id
          ,UA.[state_Id]
            ,UA.[city_Id]
            ,UA.[location_Id]
            ,UA.[Area]
            ,UA.[Street]
          ,UM.user_Name
          ,UM.mobile_Number
          ,UM.email_ID
		  ,OS.status_Name
      from 
      Orders OD
      JOIN [user_Address] UA  ON UA.[user_ID] = OD.[user_Code] AND UA.AddressId = OD.AddressId
      JOIN user_Master UM ON OD.user_Code = UM.user_Code
	  JOIN order_Status OS ON OD.orderStatus_Id=OS.orderStatus_Id
      
      Where order_id in (
        SELECT order_id FROM [OrderHistory] WHERE deliveryman_id = ${deliverymanId} AND flag = 1 AND orderStatus_Id = 5)
      
      
            `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error retrieving drop orders:', error);
    res.status(500).json({ message: 'Error retrieving drop orders.' });
  }
};
// Ensure this file exports your MSSQL connection config

 // Your existing database connection

// Handle reject order
// Handle reject order
exports.rejectOrder = async (req, res) => { 
  const { orderId, status_Name } = req.body; // Extract orderId and status_Name from request
 console.log("status_name",status_Name);
 
  try {
    const pool = await poolPromise; // Get the database connection pool

    // Start a transaction
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
       
      let orderStatusid;
      if (status_Name === 'Pick') {
        orderStatusid =3
      }
      else if(status_Name === 'Drop'){
        orderStatusid =5
      }
      // Set the flag to 0 in OrderHistory table
      await transaction.request()
        .input('orderId', sql.Int, orderId)
        .input('orderStatus_Id',sql.Int,orderStatusid)
        .query('UPDATE OrderHistory SET flag = 0 WHERE order_id = @orderId AND orderStatus_Id=@orderStatus_Id');

      // Determine the orderStatus_Id based on status_Name
      let newStatus, deleteStatus;
      if (status_Name === 'Pick') {
        newStatus = 1;   // Set the new status to 'Pick'
        deleteStatus = 2; // Delete where orderStatus_Id = 2
      } else if (status_Name === 'Drop') {
        newStatus = 4;   // Set the new status to 'Drop'
        deleteStatus = 4; // Delete where orderStatus_Id = 4
      }

      // Update order status in Orders table
      await transaction.request()
        .input('orderId', sql.Int, orderId)
        .input('newStatus', sql.Int, newStatus)
        .query('UPDATE Orders SET orderStatus_Id = @newStatus WHERE order_id = @orderId');

      // Delete from AssignDeliveryman table where order_id and orderStatus_Id
      await transaction.request()
        .input('orderId', sql.Int, orderId)
        .input('deleteStatus', sql.Int, deleteStatus)
        .query('DELETE FROM AssignDeliveryman WHERE order_id = @orderId AND orderStatus_Id = @deleteStatus');

      // Commit the transaction
      await transaction.commit();

      return res.status(200).json({ message: 'Order rejected, status updated, and delivery assignment deleted successfully' });
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      console.error('Error during transaction:', error);
      return res.status(500).json({ message: 'Failed to reject order, update status, and delete assignment', error });
    }
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ message: 'Failed to connect to the database', error });
  }
};



// Set flag to 0 for a deliveryman by deliveryman ID
// exports.deleteAnchor= async (req, res) => {
//   const { id } = req.params;

//   try {
//       const pool = await poolPromise;
//       await pool.request()
//           .input('deliveryman_Id', sql.Int, id)
//           .query(`
//               UPDATE deliveryman
//               SET flag = 0
//               WHERE deliveryman_Id = @deliveryman_Id
//           `);

//       res.status(200).json({ message: 'Deliveryman disabled successfully' });
//   } catch (error) {
//       res.status(500).json({ error: 'Failed to disable deliveryman', details: error.message });
//   }
// };
exports.deleteAnchor = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const transaction = pool.transaction();

    await transaction.begin();

    try {
      // Disable the deliveryman in the deliveryman table
      await transaction.request()
        .input('deliveryman_Id', sql.Int, id)
        .query(`
          UPDATE deliveryman
          SET flag = 0
          WHERE deliveryman_Id = @deliveryman_Id
        `);

      // Disable the corresponding user in the user_Master table
      await transaction.request()
        .input('deliveryman_Id', sql.Int, id)
        .query(`
          UPDATE user_Master
          SET active_Flag = 0, deliveryman_id = 0
          WHERE deliveryman_id = @deliveryman_Id
        `);

      await transaction.commit();

      res.status(200).json({ message: 'Deliveryman and user disabled successfully' });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to disable deliveryman and user', details: error.message });
  }
};

//module.exports = router;

// Edit deliveryman details
// exports.editAnchor=async (req, res) => {
//   const { id } = req.params;
//   const { user_Name, mobile_Number, email_ID, address,city,alternativeNumber} = req.body; // You can add more fields as needed

//   try {
//       const pool = await poolPromise;
//       await pool.request()
//           .input('deliveryman_Id', sql.Int, id)
//           .input('deliveryman_name', sql.NVarChar(100), user_Name)
//           .input('contact', sql.NVarChar(15), mobile_Number)
//           .input('email', sql.NVarChar(100), email_ID)
//           .input('alternativeNumber', sql.VarChar(15), alternativeNumber)
//           .input('city', sql.VarChar(50), city)
//           .input('address', sql.VarChar(255), address)
//           .query(`
//               UPDATE deliveryman
//               SET 
//                   deliveryman_name = @deliveryman_name,
//                   contact = @contact,
//                   email = @email,
//                   address = @address,
//                   alternativeNumber=@alternativeNumber,
//                   city=@city

//               WHERE deliveryman_id = @deliveryman_Id
//           `);

//       res.status(200).json({ message: 'Deliveryman details updated successfully' });
//   } catch (error) {
//       res.status(500).json({ error: 'Failed to update deliveryman details', details: error.message });
//   }
// };
exports.editAnchor = async (req, res) => {
  const { id } = req.params;
  const { user_Name, mobile_Number, email_ID, address, city, alternativeNumber } = req.body;

  try {
    const pool = await poolPromise;
    const transaction = pool.transaction();

    await transaction.begin();

    try {
      // Update deliveryman table
      await transaction.request()
        .input('deliveryman_Id', sql.Int, id)
        .input('deliveryman_name', sql.NVarChar(100), user_Name)
        .input('contact', sql.NVarChar(15), mobile_Number)
        .input('email', sql.NVarChar(100), email_ID)
        .input('alternativeNumber', sql.VarChar(15), alternativeNumber)
        .input('city', sql.VarChar(50), city)
        .input('address', sql.VarChar(255), address)
        
        .query(`
          UPDATE deliveryman
          SET 
              deliveryman_name = @deliveryman_name,
              contact = @contact,
              email = @email,
              address = @address,
              alternativeNumber = @alternativeNumber,
              city = @city
          WHERE deliveryman_id = @deliveryman_Id
        `);

      // Update user_Master table
      await transaction.request()
        .input('user_Name', sql.NVarChar(100), user_Name)
        .input('mobile_Number', sql.NVarChar(15), mobile_Number)
        .input('email_ID', sql.NVarChar(100), email_ID)
        .input('alternativeNumber', sql.NVarChar(50), alternativeNumber)
        .input('deliveryman_Id', sql.Int, id)// Adjust if a different ID is used in `user_Master`
        .query(`
          UPDATE user_Master
          SET 
              user_Name = @user_Name,
              mobile_Number = @mobile_Number,
              email_ID = @email_ID,
              alter_Mobile_number = @alternativeNumber
         WHERE deliveryman_id = @deliveryman_Id
        `);

      await transaction.commit();

      res.status(200).json({ message: 'Deliveryman and user details updated successfully' });
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update details', details: error.message });
  }
};

// Import your database connection
//const db = require('../config/db'); // Adjust the path to your database config file

// Function to update payment status by orderId
exports.updatePaymentStatus = async (req, res) => {
  const { orderId, paymentStatus } = req.body; // Get orderId and paymentStatus from request body

  if (!orderId || !paymentStatus) {
    return res.status(400).json({ error: 'Order ID and payment status are required.' });
  }

  try {
    // Update the orders table with the new payment status for the specified orderId
    const pool = await poolPromise;
    const request = new sql.Request(pool);

    // Use input parameters to set values for the SQL query
    request.input('paymentStatus', sql.NVarChar, paymentStatus); // Adjust sql.VarChar as needed for your data type
    request.input('orderId', sql.Int, orderId); // Adjust sql.Int as needed for your data type

    const result = await request.query(
      'UPDATE orders SET payment = @paymentStatus WHERE order_id = @orderId'
    );

    // Check if the row was updated
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    res.json({ message: 'Payment status updated successfully.' });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status.' });
  }
};