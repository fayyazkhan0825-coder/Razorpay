const express = require('express');
const AdminController = require('../controllers/adminController');
const { authenticateUser } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validateBody, validateAssignRM } = require('../middleware/validation');

const router = express.Router();

// All administration and reporting routes require authentication
router.use(authenticateUser);

// CFO only routes
router.post(
  '/roles/assign',
  requireRole('CFO'),
  validateBody({
    userId: { required: true, type: 'id' },
    role: { required: true, type: 'string', enum: ['EMP', 'RM', 'APE', 'CFO'] }
  }),
  AdminController.assignRole
);

router.post(
  '/employees/assign',
  requireRole('CFO'),
  validateAssignRM,
  AdminController.assignRM
);

router.delete(
  '/employees/assign',
  requireRole('CFO'),
  validateAssignRM,
  AdminController.removeRM
);

// Access-controlled listing route
router.get('/employees', requireRole('RM', 'APE', 'CFO'), AdminController.getEmployees);

module.exports = router;
