import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/backend_war_exploded/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
