const express = require('express');
const ReimbursementController = require('../controllers/reimbursementController');
const { authenticateUser } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validateBody, validateUpdateReimbursementStatus } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Submit reimbursement - Only EMP role can call this
router.post(
  '/',
  requireRole('EMP'),
  validateBody({
    title: { required: true, type: 'string', notEmpty: true },
    description: { required: false, type: 'string' },
    amount: { required: true, type: 'amount' }
  }),
  ReimbursementController.create
);

// Get role-scoped list of reimbursements - Any authenticated user
router.get('/', ReimbursementController.list);

// Get subordinate's reimbursements - Only RM can call this to see their own subordinate's data
router.get('/:userId', requireRole('RM'), ReimbursementController.listSubordinate);

// Approve or reject reimbursement - Accessible by RM, APE, or CFO
router.patch(
  '/',
  requireRole('RM', 'APE', 'CFO'),
  validateUpdateReimbursementStatus,
  ReimbursementController.updateStatus
);

module.exports = router;
