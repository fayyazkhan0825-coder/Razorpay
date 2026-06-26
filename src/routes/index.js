const express = require('express');
const healthRouter = require('./health');
const onboardingRouter = require('./onboarding');
const adminRouter = require('./admin');
const reimbursementRouter = require('./reimbursement');

const router = express.Router();

router.use('/health', healthRouter);
router.use('/rest/onboardings', onboardingRouter);
router.use('/rest/reimbursements', reimbursementRouter);
router.use('/rest', adminRouter);

module.exports = router;
