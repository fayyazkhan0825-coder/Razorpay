const UserRepository = require('../models/UserRepository');

class AdminService {
  /**
   * Assign a new role to a user.
   * Only allowed for valid roles, valid user, and cannot change own role.
   */
  static async assignRole(callerId, userId, newRole) {
    const allowedRoles = ['EMP', 'RM', 'APE', 'CFO'];
    if (!newRole || !allowedRoles.includes(newRole)) {
      const err = new Error(`Invalid role specified. Must be one of: ${allowedRoles.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    if (!userId) {
      const err = new Error('User ID is required.');
      err.statusCode = 400;
      throw err;
    }

    if (Number(callerId) === Number(userId)) {
      const err = new Error('Action forbidden. CFO cannot reassign their own role.');
      err.statusCode = 403;
      throw err;
    }

    const targetUser = await UserRepository.findById(userId);
    if (!targetUser) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    const [updatedUser] = await UserRepository.updateRole(userId, newRole);
    const { password_hash, ...userResponse } = updatedUser;
    return userResponse;
  }

  /**
   * Assigns an EMP to an RM.
   * Overwrites if employee already reports to an RM.
   */
  static async assignReportingManager(employeeId, rmId) {
    if (!employeeId || !rmId) {
      const err = new Error('Both employeeId and rmId are required.');
      err.statusCode = 400;
      throw err;
    }

    const employee = await UserRepository.findById(employeeId);
    if (!employee) {
      const err = new Error('Employee not found.');
      err.statusCode = 404;
      throw err;
    }

    if (employee.role !== 'EMP') {
      const err = new Error('Invalid assignment. Target employee must have the EMP role.');
      err.statusCode = 400;
      throw err;
    }

    const rm = await UserRepository.findById(rmId);
    if (!rm) {
      const err = new Error('Reporting manager not found.');
      err.statusCode = 404;
      throw err;
    }

    if (rm.role !== 'RM') {
      const err = new Error('Invalid assignment. Reporting manager must have the RM role.');
      err.statusCode = 400;
      throw err;
    }

    await UserRepository.assignRM(employeeId, rmId);
    return { employeeId, rmId };
  }

  /**
   * Removes a specific reporting manager assignment.
   */
  static async removeReportingManager(employeeId, rmId) {
    if (!employeeId || !rmId) {
      const err = new Error('Both employeeId and rmId are required.');
      err.statusCode = 400;
      throw err;
    }

    const employee = await UserRepository.findById(employeeId);
    if (!employee) {
      const err = new Error('Employee not found.');
      err.statusCode = 404;
      throw err;
    }

    const rm = await UserRepository.findById(rmId);
    if (!rm) {
      const err = new Error('Reporting manager not found.');
      err.statusCode = 404;
      throw err;
    }

    await UserRepository.removeRM(employeeId, rmId);
    return { employeeId, rmId };
  }

  /**
   * Get employee list based on caller's role.
   * - EMP: 403 Forbidden
   * - RM: only EMPs reporting to them
   * - APE: all EMPs and RMs
   * - CFO: everyone
   */
  static async getEmployeesList(caller) {
    let users = [];

    if (caller.role === 'RM') {
      users = await UserRepository.findReportingEmployees(caller.id);
    } else if (caller.role === 'APE') {
      users = await UserRepository.findEmployeesAndRMs();
    } else if (caller.role === 'CFO') {
      users = await UserRepository.findAllUsers();
    }

    return users;
  }
}

module.exports = AdminService;
