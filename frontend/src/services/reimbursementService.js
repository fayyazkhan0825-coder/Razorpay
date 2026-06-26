import api from './api';

const reimbursementService = {
  /**
   * Submit a new reimbursement claim (EMP only)
   */
  create: async (title, description, amount) => {
    const response = await api.post('/rest/reimbursements', { title, description, amount });
    return response.data;
  },

  /**
   * Get role-scoped list of reimbursements
   */
  list: async () => {
    const response = await api.get('/rest/reimbursements');
    return response.data;
  },

  /**
   * Get direct subordinate's list of reimbursements (RM only)
   */
  listSubordinate: async (userId) => {
    const response = await api.get(`/rest/reimbursements/${userId}`);
    return response.data;
  },

  /**
   * Approve or reject a reimbursement (RM, APE, CFO)
   * Payload requires reimbursementId (or userId fallback) and status ('APPROVED' or 'REJECTED')
   */
  updateStatus: async (reimbursementId, status) => {
    const response = await api.patch('/rest/reimbursements', { reimbursementId, status });
    return response.data;
  },

  /**
   * Update a pending reimbursement claim (EMP only)
   */
  update: async (id, title, description, amount) => {
    const response = await api.put(`/rest/reimbursements/${id}`, { title, description, amount });
    return response.data;
  },

  /**
   * Delete a pending reimbursement claim (EMP only)
   */
  delete: async (id) => {
    const response = await api.delete(`/rest/reimbursements/${id}`);
    return response.data;
  },

  // CFO and Admin routes

  /**
   * Get employees list (accessible by RM, APE, CFO)
   */
  getEmployees: async () => {
    const response = await api.get('/rest/employees');
    return response.data;
  },

  /**
   * Assign role to user (CFO only)
   */
  assignRole: async (userId, role) => {
    const response = await api.post('/rest/roles/assign', { userId, role });
    return response.data;
  },

  /**
   * Assign Reporting Manager to Employee (CFO only)
   */
  assignRM: async (employeeId, rmId) => {
    const response = await api.post('/rest/employees/assign', { employeeId, rmId });
    return response.data;
  },

  /**
   * Remove Reporting Manager relationship (CFO only)
   */
  removeRM: async (employeeId, rmId) => {
    const response = await api.delete('/rest/employees/assign', { data: { employeeId, rmId } });
    return response.data;
  }
};

export default reimbursementService;
