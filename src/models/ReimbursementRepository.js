/**
 * @file ReimbursementRepository.js
 * @description Repository pattern abstraction for DB operations on the reimbursements table.
 * 
 * SCHEMA DESIGN CHOICE EXPLANATION:
 * We store `rm_approval_status` and `ape_approval_status` as separate columns (both defaulting to 'PENDING')
 * rather than overloading a single 'status' field.
 * - Tradeoffs/Benefits:
 *   1. Preserves state: We can instantly determine whether the RM has approved, the APE has approved,
 *      or who rejected it, without complex state history arrays or event-sourcing tracking.
 *   2. Independent transitions: Approvals happen asynchronously (RM first, then APE). Keeping status fields
 *      independent represents the business pipeline directly in the row schema.
 *   3. Derived Computed Status: The EMP-facing overall status can be easily computed dynamically
 *      (PENDING until both RM and APE approve, REJECTED if either rejects, APPROVED only when both approve).
 */

const db = require('../config/db');

class ReimbursementRepository {
  /**
   * Insert a new reimbursement record
   */
  static async create(reimbursement) {
    return db('reimbursements').insert(reimbursement).returning('*');
  }

  /**
   * Find a single reimbursement by unique ID
   */
  static async findById(id) {
    return db('reimbursements').where({ id }).first();
  }

  /**
   * Find the oldest pending reimbursement for a specific employee
   */
  static async findOldestPendingByEmployeeId(employeeId) {
    return db('reimbursements')
      .where({ employee_id: employeeId })
      .andWhere(function() {
        this.where('rm_approval_status', 'PENDING')
          .orWhere('ape_approval_status', 'PENDING');
      })
      .orderBy('created_at', 'asc')
      .first();
  }

  /**
   * Update the status fields of a reimbursement
   */
  static async updateStatuses(id, rmApprovalStatus, apeApprovalStatus) {
    return db('reimbursements')
      .where({ id })
      .update({
        rm_approval_status: rmApprovalStatus,
        ape_approval_status: apeApprovalStatus
      })
      .returning('*');
  }

  /**
   * Find all reimbursements created by a specific employee
   */
  static async findByEmployeeId(employeeId) {
    return db('reimbursements')
      .where({ employee_id: employeeId })
      .orderBy('created_at', 'desc');
  }

  /**
   * Find all reimbursements awaiting RM approval for a specific RM
   */
  static async findPendingForRM(rmId) {
    return db('reimbursements')
      .where({ rm_id: rmId, rm_approval_status: 'PENDING' })
      .orderBy('created_at', 'desc');
  }

  /**
   * Find all reimbursements awaiting APE approval for a specific APE (must be RM-approved first)
   */
  static async findPendingForAPE(apeId) {
    return db('reimbursements')
      .where({
        ape_id: apeId,
        rm_approval_status: 'APPROVED',
        ape_approval_status: 'PENDING'
      })
      .orderBy('created_at', 'desc');
  }

  /**
   * Find all reimbursements fully approved (by APE level, which implies RM-approved)
   */
  static async findApprovedForCFO() {
    return db('reimbursements')
      .where({ ape_approval_status: 'APPROVED' })
      .orderBy('created_at', 'desc');
  }

  /**
   * Update a reimbursement record by ID
   */
  static async update(id, data) {
    return db('reimbursements')
      .where({ id })
      .update(data)
      .returning('*');
  }

  /**
   * Delete a reimbursement record by ID
   */
  static async delete(id) {
    return db('reimbursements')
      .where({ id })
      .del();
  }
}

module.exports = ReimbursementRepository;
