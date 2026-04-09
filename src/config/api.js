const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_URL = rawApiUrl.replace(/\/+$/, '');

export const apiUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
};

export const authHeaders = (token) =>
  token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
