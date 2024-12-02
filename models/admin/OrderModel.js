const { poolPromise,sql } = require('../../db');

const getAllOrderDetails = async () => {
  try {
    const pool = await poolPromise;

    // Query to get all order details along with user and status info
    // const query = `
    //   SELECT o.order_id, o.order_date, o.total_price, COUNT(oi.item_id) as total_item, 
    //          u.user_Name, u.email_Id, u.mobile_Number,
    //          s.status_Name
    //   FROM orders o
    //   JOIN user_Master u ON o.user_Code = u.user_Code
    //   JOIN order_Status s ON o.orderStatus_Id = s.orderStatus_Id
    //   JOIN orderItems oi ON o.order_id = oi.order_id
    //   GROUP BY o.order_id, o.order_date, o.total_price, u.user_Name, u.email_Id, u.mobile_Number, s.status_Name;
    // `;
    const query=`

SELECT 
       o.order_id, 
       o.order_date, 
       o.total_price,
       o.payment ,
       COUNT(oi.item_id) AS total_item, 
       u.user_Name, 
       u.user_Code,
       u.email_Id, 
       u.mobile_Number, 
       ua.city_Id, 
       s.status_Name,
       d.deliveryman_name
FROM 
       orders o
JOIN 
       user_Master u ON o.user_Code = u.user_Code
JOIN 
       user_Address ua ON ua.user_ID = o.user_Code AND o.AddressId = ua.AddressId
JOIN 
       order_Status s ON o.orderStatus_Id = s.orderStatus_Id
JOIN 
       orderItems oi ON o.order_id = oi.order_id
LEFT JOIN 
       deliveryman d ON o.deliveryman_id = d.deliveryman_id
GROUP BY 
       o.order_id, 
       o.order_date, 
       o.total_price, 
        o.payment ,
       u.user_Name, 
       u.user_Code,
       u.email_Id, 
       u.mobile_Number, 
       ua.city_Id, 
       s.status_Name, 
       d.deliveryman_name
ORDER BY 
       o.order_id DESC;

`
    const result = await pool.request().query(query);

    return result.recordset; // Return all results
  } catch (error) {
    console.error('Error in getAllOrderDetails:', error.message); // Log the actual error
    throw new Error('Database query failed');
  }
};
const getOrderIdDetails = async (orderId) => {
    try {
      const pool = await poolPromise;
  
      // Query to get order details along with user and status info
      const query = `
        SELECT o.order_id, o.order_date, o.total_price, COUNT(oi.item_id) as total_item, 
               u.user_Name, u.email_Id, u.mobile_Number,
               s.status_Name
        FROM orders o
        JOIN user_Master u ON o.user_Code = u.user_Code
        JOIN order_Status s ON o.orderStatus_Id = s.orderStatus_Id
        JOIN orderitem oi ON o.order_id = oi.order_id
        WHERE o.order_id = @orderId
        GROUP BY o.order_id, o.order_date, o.total_price, u.user_Name, u.email_Id, u.mobile_Number, s.status_Name;
      `;
  
      const result = await pool.request()
        .input('orderId', sql.Int, orderId)
        .query(query);
  
      return result.recordset[0]; // Return the first result (if any)
    } catch (error) {
      throw new Error('Database query failed');
    }
  };

  const updateOrderStatus = async (order_id, status_id) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('order_id', sql.Int, order_id)
            .input('status_id', sql.Int, status_id)
            .query(`
                UPDATE orders
                SET orderStatus_Id = @status_id
                WHERE order_id = @order_id
            `);

        return result.rowsAffected[0]; // Returning number of rows affected (1 if successful)
    } catch (error) {
        throw new Error('Error updating order status');
    }
};

module.exports = { getAllOrderDetails,getOrderIdDetails,updateOrderStatus };
