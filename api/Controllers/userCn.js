import User from '../models/User.js';

class UserController {
  static async createUser(req, res) {
    try {
      const { phoneNumber, email } = req.body;
      
      // بررسی تکراری نبودن اطلاعات
      const existingByPhone = await User.findByPhoneNumber(phoneNumber);
      const existingByEmail = await User.findByEmail(email);
      
      if (existingByPhone || existingByEmail) {
        return res.status(400).json({ 
          error: 'User with this phone number or email already exists' 
        });
      }

      const userId = await User.create({ phoneNumber, email });
      
      res.status(201).json({
        message: 'User created successfully',
        userId
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default UserController;