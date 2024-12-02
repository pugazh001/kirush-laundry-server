const { getAllOrderDetails ,getOrderIdDetails,updateOrderStatus} = require('../../models/admin/OrderModel');

const fetchAllOrderDetails = async (req, res) => {
  try {
    const allOrders = await getAllOrderDetails();

    if (allOrders.length > 0) {
      res.status(200).json({
        success: true,
        data: allOrders
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'No orders found'
      });
     
      
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order details',
      error: error.message
    });
    console.log(error);
  }
};
const fetchOrderIdDetails = async (req, res) => {
    const { orderId } = req.params;
  
    try {
      const orderDetails = await getOrderIdDetails(orderId);
  
      if (orderDetails) {
        res.status(200).json({
          success: true,
          data: orderDetails
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching order details',
        error: error.message
      });
    }
  };
  

  // Update order status to "Ready to Drop"
const setReadyToDrop = async (req, res) => {
  try {
      const { order_id } = req.params;
      const updatedOrder = await updateOrderStatus(order_id, 4); // Status 4 is 'Ready to Drop'
      res.status(200).json({ message: 'Order status updated to Ready to Drop', updatedOrder });
  } catch (error) {
      res.status(500).json({ error: 'Failed to update order status' });
  }
};

// Update order status to "Completed"
const setCompleted = async (req, res) => {
  try {
      const { order_id } = req.params;
      const updatedOrder = await updateOrderStatus(order_id, 6); // Status 6 is 'Completed'
      res.status(200).json({ message: 'Order status updated to Completed', updatedOrder });
  } catch (error) {
      res.status(500).json({ error: 'Failed to update order status' });
  }
};

module.exports = { fetchAllOrderDetails,fetchOrderIdDetails ,setReadyToDrop,setCompleted};
