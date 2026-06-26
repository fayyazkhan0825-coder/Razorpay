const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');

const router = express.Router();

router.post(
  '/register',
  validateBody({
    name: { required: true, type: 'string', notEmpty: true },
    email: { required: true, type: 'string', email: true, orgEmail: true },
    password: { required: true, type: 'string', notEmpty: true }
  }),
  AuthController.register
);

router.post(
  '/login',
  validateBody({
    email: { required: true, type: 'string', email: true, orgEmail: true },
    password: { required: true, type: 'string', notEmpty: true }
  }),
  AuthController.login
);

router.post('/logout', AuthController.logout);

// Profile endpoints
router.get('/profile', authenticateUser, AuthController.getProfile);
router.put(
  '/profile',
  authenticateUser,
  validateBody({
    name: { required: false, type: 'string', notEmpty: true },
    password: { required: false, type: 'string', notEmpty: true }
  }),
  AuthController.updateProfile
);

module.exports = router;
