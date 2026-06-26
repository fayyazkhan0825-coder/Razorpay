const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../models/UserRepository');

class AuthService {
  /**
   * Register a new user with name, email, and password.
   * Only allows @org.com emails, defaults role to EMP, hashes password.
   */
  static async registerUser(name, email, password) {
    if (!name || !name.trim() || !email || !email.trim() || !password) {
      const err = new Error('Name, email, and password are required.');
      err.statusCode = 400;
      throw err;
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail.endsWith('@org.com')) {
      const err = new Error('Registration failed. Only emails ending with @org.com are allowed.');
      err.statusCode = 400;
      throw err;
    }

    const existingUser = await UserRepository.findByEmail(trimmedEmail);
    if (existingUser) {
      const err = new Error('Registration failed. Email is already registered.');
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await UserRepository.create({
      name: name.trim(),
      email: trimmedEmail,
      password_hash: passwordHash,
      role: 'EMP'
    });

    const { password_hash, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  /**
   * Log in user using email and password.
   * Generates JWT token on successful credential verification.
   */
  static async loginUser(email, password) {
    if (!email || !email.trim() || !password) {
      const err = new Error('Email and password are required.');
      err.statusCode = 400;
      throw err;
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail.endsWith('@org.com')) {
      const err = new Error('Login failed. Only emails ending with @org.com are allowed.');
      err.statusCode = 400;
      throw err;
    }

    const user = await UserRepository.findByEmail(trimmedEmail);
    if (!user) {
      const err = new Error('Login failed. Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      const err = new Error('Login failed. Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    // Generate JWT token containing key user details
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'supersecretjwtsecret',
      { expiresIn: '24h' }
    );

    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }
}

module.exports = AuthService;
