import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
if (API_URL && !API_URL.endsWith('/api/v1')) {
  API_URL = API_URL.replace(/\/$/, '') + '/api/v1';
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
