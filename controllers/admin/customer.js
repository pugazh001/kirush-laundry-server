const UserModel = require('../../models/admin/customer');

// Controller function to get users with user_Type_ID = 5
const getUsersByType = async (req, res) => {
  try {
    const users = await UserModel.getUsersByType();
    if (users.length > 0) {
      res.status(200).json({ success: true, data: users });
    } else {
      res.status(404).json({ success: false, message: 'No users found.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsersByType,
};
