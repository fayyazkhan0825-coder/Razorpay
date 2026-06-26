import axios from 'axios';

// Create an Axios instance pointing to the backend API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://razorpay-2fdh.onrender.com',
  withCredentials: true, // Crucial for receiving/sending HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  }
});

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend returns 401 (Unauthorized), we can handle it or pass it along.
    // The AuthContext will intercept this to clean up user state if needed.
    const message = error.response?.data?.message || 'Something went wrong';
    console.error('[API Error]:', message);
    return Promise.reject(error);
  }
);

export default api;
