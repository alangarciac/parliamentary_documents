const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { Op } = require('sequelize');

class AuthService {
  static async login(username, password) {
    try {
      // Find user by email or name
      const user = await User.findOne({
        where: {
          [Op.or]: [
            { email: username },
            { name: username }
          ]
        },
        include: [{
          model: Role,
          as: 'role'
        }]
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Simple password comparison (for development only)
      if (password !== user.password) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Return user data without password
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role ? user.role.name : null
      };

      return { user: userData, token };
    } catch (error) {
      throw error;
    }
  }

  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Get fresh user data
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
        include: [{
          model: Role,
          as: 'role'
        }]
      });

      if (!user) {
        throw new Error('User not found');
      }

      return { user };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthService; 