const AuthService = require('../services/authService');

class AuthController {
  /**
   * Register a new user
   */
  static async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const user = await AuthService.registerUser(name, email, password);

      return res.status(201).json({
        success: true,
        message: 'User registered successfully.',
        data: { user }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Log in an existing user and set an httpOnly session cookie
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.loginUser(email, password);

      // Set JWT in httpOnly cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours in ms
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: { user }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Log out the current user by clearing the httpOnly cookie
   */
  static async logout(req, res, next) {
    try {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get the current user's profile
   */
  static async getProfile(req, res, next) {
    try {
      const UserRepository = require('../models/UserRepository');
      const user = await UserRepository.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found.'
        });
      }
      const { password_hash, ...userWithoutPassword } = user;
      return res.status(200).json({
        success: true,
        data: { user: userWithoutPassword }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Update the current user's profile (name or password)
   */
  static async updateProfile(req, res, next) {
    try {
      const { name, password } = req.body;
      const UserRepository = require('../models/UserRepository');
      const bcrypt = require('bcryptjs');

      const updates = {};
      if (name && name.trim()) {
        updates.name = name.trim();
      }
      if (password) {
        updates.password_hash = await bcrypt.hash(password, 10);
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'No update data provided.'
        });
      }

      const [updatedUser] = await UserRepository.update(req.user.id, updates);
      if (!updatedUser) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found.'
        });
      }

      const { password_hash, ...userWithoutPassword } = updatedUser;
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: { user: userWithoutPassword }
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = AuthController;
