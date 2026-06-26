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
}

module.exports = AuthController;
