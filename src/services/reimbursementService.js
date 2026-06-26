const db = require('../config/db');
const UserRepository = require('../models/UserRepository');
const ReimbursementRepository = require('../models/ReimbursementRepository');

class ReimbursementService {
  /**
   * Helper to derive the overall status of a reimbursement based on approval flags
   */
  static deriveStatus(reimbursement) {
    const { rm_approval_status, ape_approval_status } = reimbursement;

    let computedStatus = 'PENDING';
    if (rm_approval_status === 'REJECTED' || ape_approval_status === 'REJECTED') {
      computedStatus = 'REJECTED';
    } else if (rm_approval_status === 'APPROVED' && ape_approval_status === 'APPROVED') {
      computedStatus = 'APPROVED';
    }

    return {
      id: reimbursement.id,
      employee_id: reimbursement.employee_id,
      title: reimbursement.title,
      description: reimbursement.description,
      amount: reimbursement.amount,
      status: computedStatus,
      rm_approval_status,
      ape_approval_status
    };
  }

  /**
   * Submit a new reimbursement (Only for EMP role)
   */
  static async createReimbursement(employeeId, data) {
    const { title, description, amount } = data;

    if (!title || !title.trim() || amount === undefined || amount === null) {
      const err = new Error('Reimbursement title and amount are required.');
      err.statusCode = 400;
      throw err;
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      const err = new Error('Amount must be a positive number.');
      err.statusCode = 400;
      throw err;
    }

    // 1. Locate the employee's assigned RM
    const relationship = await db('employee_rm').where({ employee_id: employeeId }).first();
    if (!relationship) {
      const err = new Error('Submission failed. You must have an assigned reporting manager (RM) to submit reimbursements.');
      err.statusCode = 400;
      throw err;
    }
    const rmId = relationship.rm_id;

    // 2. Locate the APE level approval target
    // We look up the RM's manager. If they hold the APE role, we use them.
    const rmRelationship = await db('employee_rm').where({ employee_id: rmId }).first();
    let apeId = null;

    if (rmRelationship) {
      const rmManager = await UserRepository.findById(rmRelationship.rm_id);
      if (rmManager && rmManager.role === 'APE') {
        apeId = rmManager.id;
      }
    }

    // Fallback: Find the first available APE in the database
    if (!apeId) {
      const firstApe = await db('users').where({ role: 'APE' }).first();
      if (!firstApe) {
        const err = new Error('Submission failed. No Approval Executive (APE) is configured in the system.');
        err.statusCode = 400;
        throw err;
      }
      apeId = firstApe.id;
    }

    // 3. Create the record
    const [newReimbursement] = await ReimbursementRepository.create({
      employee_id: employeeId,
      title: title.trim(),
      description: description ? description.trim() : null,
      amount: numericAmount,
      rm_id: rmId,
      ape_id: apeId,
      rm_approval_status: 'PENDING',
      ape_approval_status: 'PENDING'
    });

    return ReimbursementService.deriveStatus(newReimbursement);
  }

  /**
   * Get role-scoped list of reimbursements
   */
  static async getReimbursementsList(user) {
    let list = [];

    if (user.role === 'EMP') {
      list = await ReimbursementRepository.findByEmployeeId(user.id);
    } else if (user.role === 'RM') {
      list = await ReimbursementRepository.findPendingForRM(user.id);
    } else if (user.role === 'APE') {
      list = await ReimbursementRepository.findPendingForAPE(user.id);
    } else if (user.role === 'CFO') {
      list = await ReimbursementRepository.findApprovedForCFO();
    }

    return list.map(ReimbursementService.deriveStatus);
  }

  /**
   * Get direct employee subordinate's reimbursements (Only for RM)
   */
  static async getSubordinateReimbursements(rmId, employeeId) {
    if (!employeeId) {
      const err = new Error('Subordinate Employee ID is required.');
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
      const err = new Error('Access denied. The target user is not an employee.');
      err.statusCode = 400;
      throw err;
    }

    // Check direct subordinate relation
    const relationship = await db('employee_rm')
      .where({ employee_id: employeeId, rm_id: rmId })
      .first();

    if (!relationship) {
      const err = new Error('Access denied. The specified user is not your direct subordinate.');
      err.statusCode = 403;
      throw err;
    }

    const list = await ReimbursementRepository.findByEmployeeId(employeeId);
    return list.map(ReimbursementService.deriveStatus);
  }

  /**
   * Update reimbursement approval/rejection status (Approve or Reject)
   * 
   * DESIGN ASSUMPTION FOR IDENTIFYING REIMBURSEMENT:
   * Since multiple reimbursements can be submitted by the same user, unique identification via `reimbursementId`
   * is preferred. However, to support API formats where `userId` is passed instead, we accept both:
   * - `reimbursementId`: uniquely targets the claim.
   * - `userId`: fallbacks to querying the oldest pending reimbursement submitted by that employee.
   */
  static async updateReimbursementStatus(caller, target, newStatus) {
    const { reimbursementId, userId } = target;

    const allowedStatuses = ['APPROVED', 'REJECTED'];
    if (!newStatus || !allowedStatuses.includes(newStatus)) {
      const err = new Error('Invalid status. Status must be APPROVED or REJECTED.');
      err.statusCode = 400;
      throw err;
    }

    // Resolve reimbursement record
    let reimbursement = null;
    if (reimbursementId) {
      reimbursement = await ReimbursementRepository.findById(reimbursementId);
    } else if (userId) {
      reimbursement = await ReimbursementRepository.findOldestPendingByEmployeeId(userId);
    }

    if (!reimbursement) {
      const err = new Error('Reimbursement not found.');
      err.statusCode = 404;
      throw err;
    }

    // Verify overall status is not already finalized
    const currentDerived = ReimbursementService.deriveStatus(reimbursement);
    if (currentDerived.status === 'APPROVED' || currentDerived.status === 'REJECTED') {
      const err = new Error('Action rejected. Reimbursement has already been finalized.');
      err.statusCode = 400;
      throw err;
    }

    let targetRmStatus = reimbursement.rm_approval_status;
    let targetApeStatus = reimbursement.ape_approval_status;

    if (caller.role === 'RM') {
      // 1. Direct subordinate check
      const relation = await db('employee_rm')
        .where({ employee_id: reimbursement.employee_id, rm_id: caller.id })
        .first();

      if (!relation) {
        const err = new Error('Access denied. Target user is not your direct subordinate.');
        err.statusCode = 403;
        throw err;
      }

      // 2. Stage check
      if (reimbursement.rm_approval_status !== 'PENDING') {
        const err = new Error('Action rejected. Reimbursement is not pending at the RM approval stage.');
        err.statusCode = 400;
        throw err;
      }

      targetRmStatus = newStatus;

    } else if (caller.role === 'APE') {
      // 1. Assigned APE check
      if (reimbursement.ape_id !== caller.id) {
        const err = new Error('Access denied. You are not the assigned APE for this reimbursement.');
        err.statusCode = 403;
        throw err;
      }

      // 2. RM must have approved first
      if (reimbursement.rm_approval_status === 'PENDING') {
        const err = new Error('Action rejected. Reimbursement is awaiting RM approval first.');
        err.statusCode = 400;
        throw err;
      }

      // 3. Stage check
      if (reimbursement.ape_approval_status !== 'PENDING') {
        const err = new Error('Action rejected. Reimbursement is not pending at the APE approval stage.');
        err.statusCode = 400;
        throw err;
      }

      targetApeStatus = newStatus;

    } else if (caller.role === 'CFO') {
      // CFO override bypasses all intermediate stage checks
      if (newStatus === 'APPROVED') {
        targetRmStatus = 'APPROVED';
        targetApeStatus = 'APPROVED';
      } else {
        targetRmStatus = 'REJECTED';
        targetApeStatus = 'REJECTED';
      }
    }

    // Save changes
    const [updatedRecord] = await ReimbursementRepository.updateStatuses(
      reimbursement.id,
      targetRmStatus,
      targetApeStatus
    );

    return ReimbursementService.deriveStatus(updatedRecord);
  }
}

module.exports = ReimbursementService;
