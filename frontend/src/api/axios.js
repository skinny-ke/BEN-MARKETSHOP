import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to get Clerk token (will be set by components)
let getClerkToken = null;

export const setClerkTokenGetter = (tokenGetter) => {
  getClerkToken = tokenGetter;
};

// Request interceptor to add Clerk auth token
api.interceptors.request.use(
  async (config) => {
    if (getClerkToken) {
      try {
        const token = await getClerkToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting Clerk token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const msg = error.response?.data?.message || error.message || 'Request failed';
    if (status === 401) {
      toast.error('Session expired. Please sign in again.');
    } else if (status === 429) {
      toast.warning('Too many requests. Please slow down.');
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(msg);
    }
    return Promise.reject(error);
  }
);

export default api;
