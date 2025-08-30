import axios from 'axios';

// Get the backend URL from environment variables
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

if (!API_BASE_URL) {
  console.warn('VITE_BACKEND_URL is not set. Using default localhost URL.');
}

const api = axios.create({
  baseURL: `${API_BASE_URL || 'http://localhost:5000'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true, // Enable sending cookies in cross-origin requests
});

export const testConnection = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    throw new Error(`Cannot connect to server at ${API_BASE_URL}: ${error.message}`);
  }
};

export const adminAPI = {
  testConnection,

  // Admin signup
  signup: async (adminData) => {
    try {
      const response = await api.post('/admin/signup', adminData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error during signup' };
    }
  },

  // Admin login
  login: async (credentials) => {
    try {
      const response = await api.post('/admin/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error during login' };
    }
  },

  // Upload CSV file
  uploadCSV: async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/questions/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error during CSV upload' };
    }
  },

  // Get questions for a specific company
  getQuestions: async (companyName) => {
    try {
      const response = await api.get(`/questions/${companyName.toLowerCase()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error fetching questions' };
    }
  },

  // Get all companies with question counts
  getAllCompanies: async () => {
    try {
      const response = await api.get('/questions');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error fetching companies' };
    }
  },

  // Get admin profile
  getProfile: async (adminId) => {
    try {
      const response = await api.get(`/admin/profile/${adminId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get profile' };
    }
  }
};

export default adminAPI;
