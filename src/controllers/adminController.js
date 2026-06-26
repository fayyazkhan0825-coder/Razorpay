const AdminService = require('../services/adminService');

class AdminController {
  /**
   * Assign role to user
   */
  static async assignRole(req, res, next) {
    try {
      const { userId, role } = req.body;
      const callerId = req.user.id;

      const user = await AdminService.assignRole(callerId, userId, role);

      return res.status(200).json({
        success: true,
        message: 'Role assigned successfully.',
        data: { user }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Assign employee reporting to a Manager (RM)
   */
  static async assignRM(req, res, next) {
    try {
      // Support both employeeId/rmId and fallback to userId/rmId
      const employeeId = req.body.employeeId || req.body.userId;
      const { rmId } = req.body;

      await AdminService.assignReportingManager(employeeId, rmId);

      return res.status(200).json({
        success: true,
        message: 'Reporting manager assigned successfully.',
        data: { employeeId, rmId }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Remove employee reporting relationship
   */
  static async removeRM(req, res, next) {
    try {
      // Support both employeeId/rmId and fallback to userId/rmId
      const employeeId = req.body.employeeId || req.body.userId;
      const { rmId } = req.body;

      await AdminService.removeReportingManager(employeeId, rmId);

      return res.status(200).json({
        success: true,
        message: 'Reporting relationship removed successfully.'
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Retrieve employees list based on role visibility
   */
  static async getEmployees(req, res, next) {
    try {
      const users = await AdminService.getEmployeesList(req.user);

      return res.status(200).json({
        status: 'success',
        data: { users }
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = AdminController;
