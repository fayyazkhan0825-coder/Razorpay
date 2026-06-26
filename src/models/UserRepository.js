const db = require('../config/db');

class UserRepository {
  static async findById(id) {
    return db('users').where({ id }).first();
  }

  static async findByEmail(email) {
    return db('users').where({ email }).first();
  }

  static async create(user) {
    return db('users').insert(user).returning('*');
  }

  static async updateRole(userId, role) {
    return db('users')
      .where({ id: userId })
      .update({ role })
      .returning('*');
  }

  /**
   * Assigns an employee to a reporting manager (RM).
   * Overwrites if the relationship already exists for the employee.
   */
  static async assignRM(employeeId, rmId) {
    return db('employee_rm')
      .insert({
        employee_id: employeeId,
        rm_id: rmId
      })
      .onConflict('employee_id')
      .merge();
  }

  /**
   * Removes a specific employee-RM relationship.
   */
  static async removeRM(employeeId, rmId) {
    return db('employee_rm')
      .where({
        employee_id: employeeId,
        rm_id: rmId
      })
      .del();
  }

  /**
   * Returns employees reporting to a specific RM.
   */
  static async findReportingEmployees(rmId) {
    return db('users')
      .join('employee_rm', 'users.id', 'employee_rm.employee_id')
      .where('employee_rm.rm_id', rmId)
      .select('users.id as userId', 'users.name', 'users.email', 'users.role');
  }

  /**
   * Returns all users with role EMP or RM.
   */
  static async findEmployeesAndRMs() {
    return db('users')
      .whereIn('role', ['EMP', 'RM'])
      .select('id as userId', 'name', 'email', 'role');
  }

  /**
   * Returns all users.
   */
  static async findAllUsers() {
    return db('users')
      .select('id as userId', 'name', 'email', 'role');
  }
}

module.exports = UserRepository;
