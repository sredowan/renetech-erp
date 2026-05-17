import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

export const getBackendFileUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (/^https?:\/\//i.test(apiBaseUrl)) {
    return `${apiBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '')}${normalizedPath}`;
  }

  return normalizedPath;
};

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

const clearStoredSession = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedBranch');
  } catch {}
};

const isAuthValidationRequest = (config) => {
  const url = config?.url || '';
  return url === '/auth/me' || url.endsWith('/auth/me');
};

// Request interceptor for adding JWT token
api.interceptors.request.use(
  (config) => {
    let token = null;
    let branchId = null;
    try {
      token = localStorage.getItem('token');
      branchId = localStorage.getItem('selectedBranch');
    } catch {
      // Storage can fail in restricted browser contexts; continue without auth headers.
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (branchId) {
      config.headers['X-Branch-Id'] = branchId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if ([401, 403].includes(error?.response?.status) && isAuthValidationRequest(error?.config)) {
      clearStoredSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
        window.location.replace('/admin/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
