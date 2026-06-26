const express = require('express');
const AuthController = require('../controllers/authController');
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

module.exports = router;
