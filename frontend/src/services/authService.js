import api from './api';

const authService = {
  /**
   * Log in user with email and password
   */
  login: async (email, password) => {
    const response = await api.post('/rest/onboardings/login', { email, password });
    return response.data;
  },

  /**
   * Register a new employee
   */
  register: async (name, email, password) => {
    const response = await api.post('/rest/onboardings/register', { name, email, password });
    return response.data;
  },

  /**
   * Log out the current user
   */
  logout: async () => {
    const response = await api.post('/rest/onboardings/logout');
    return response.data;
  },

  /**
   * Fetch current authenticated user's profile
   */
  getProfile: async () => {
    const response = await api.get('/rest/onboardings/profile');
    return response.data;
  },

  /**
   * Update current user's profile name and/or password
   */
  updateProfile: async (data) => {
    const response = await api.put('/rest/onboardings/profile', data);
    return response.data;
  }
};

export default authService;
