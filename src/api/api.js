import axios from 'axios';
const API_URL = import.meta.env.VITE_API_BASE_URL|| 'http://localhost:8080';
const api = axios.create({
  baseURL: API_URL, // spring boot port
  withCredentials: true,

});

// Interceptor: before every request, it checks the localstorage for a token and adds it to the headers
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {  
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default api;