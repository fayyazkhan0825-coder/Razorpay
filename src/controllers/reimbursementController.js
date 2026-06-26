const ReimbursementService = require('../services/reimbursementService');

class ReimbursementController {
  /**
   * Create reimbursement
   */
  static async create(req, res, next) {
    try {
      const reimbursement = await ReimbursementService.createReimbursement(req.user.id, req.body);

      return res.status(201).json({
        status: 'success',
        data: { reimbursement }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * List reimbursements based on role permissions
   */
  static async list(req, res, next) {
    try {
      const reimbursements = await ReimbursementService.getReimbursementsList(req.user);

      return res.status(200).json({
        status: 'success',
        data: { reimbursements }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * List reimbursements for a subordinate employee (only allowed for RM)
   */
  static async listSubordinate(req, res, next) {
    try {
      const { userId } = req.params;
      const callerId = req.user.id;

      const reimbursements = await ReimbursementService.getSubordinateReimbursements(callerId, userId);

      return res.status(200).json({
        status: 'success',
        data: { reimbursements }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Update reimbursement approval/rejection status (Approve or Reject)
   */
  static async updateStatus(req, res, next) {
    try {
      // Support both reimbursementId and userId fallback parameters in body
      const { reimbursementId, userId, status } = req.body;
      const caller = req.user;

      const reimbursement = await ReimbursementService.updateReimbursementStatus(
        caller,
        { reimbursementId, userId },
        status
      );

      return res.status(200).json({
        status: 'success',
        data: { reimbursement }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Update pending reimbursement
   */
  static async update(req, res, next) {
    try {
      const reimbursementId = req.params.id;
      const employeeId = req.user.id;

      const reimbursement = await ReimbursementService.updateReimbursement(
        employeeId,
        reimbursementId,
        req.body
      );

      return res.status(200).json({
        status: 'success',
        data: { reimbursement }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Delete pending reimbursement
   */
  static async delete(req, res, next) {
    try {
      const reimbursementId = req.params.id;
      const employeeId = req.user.id;

      const result = await ReimbursementService.deleteReimbursement(
        employeeId,
        reimbursementId
      );

      return res.status(200).json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = ReimbursementController;
