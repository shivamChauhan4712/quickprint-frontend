import axios from 'axios';
const api = axios.create({
  baseURL: 'http://192.168.1.139:8080', // spring boot port
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