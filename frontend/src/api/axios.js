import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Function to set Clerk token getter
let getClerkToken = null;
export const setClerkTokenGetter = (tokenGetter) => {
  getClerkToken = tokenGetter;
};

// ✅ Interceptor to add token automatically
api.interceptors.request.use(
  async (config) => {
    if (getClerkToken) {
      try {
        let token = null;
        try {
          token = await getClerkToken({ template: 'default' });
        } catch (_) {}
        if (!token) token = await getClerkToken();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          config.headers['Clerk-Auth-Token'] = token;
          // 👇 Optional: debug to confirm token is valid
          // console.log('🪪 Attaching token:', token.slice(0, 25) + '...');
        }
      } catch (error) {
        console.error('Error getting Clerk token:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle API errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const msg = error.response?.data?.message || error.message || 'Request failed';

    if (status === 401) {
      toast.error('Session expired or unauthorized. Please sign in again.');
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
