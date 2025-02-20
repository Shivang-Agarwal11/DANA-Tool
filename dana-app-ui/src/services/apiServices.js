import axios from 'axios';

// Base URL for the API
const API_BASE_URL = 'http://localhost:8088/user'; // Replace with your actual base URL

// Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
});

// Request interceptor to add the Authorization header to all requests except login and signup
apiClient.interceptors.request.use((config) => {
  if (!config.url.includes('/login') && !config.url.includes('/auth/signup')) {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor to handle token storage on login/signup
apiClient.interceptors.response.use((response) => {
  if (response.config.url.includes('/login') || response.config.url.includes('/user')) {
    const token = response.data?.data?.token; // Extract the token from the response
    if (token) {
      localStorage.setItem('authToken', token); // Save the token to localStorage
    }
  }
  return response;
}, (error) => Promise.reject(error));

export const apiService = {
  // Auth APIs
  login: (credentials) => apiClient.post('/login', credentials),
  signup: (userData) => apiClient.post('/', userData),
  logout: () => apiClient.post('/logout'),
  getGithubStats: () => apiClient.get('/github/insights'),
  getJenkinsJobs:() => apiClient.get('/jenkins/jobs'),
  getJenkinsLastBuild:(jobName) => apiClient.post('/jenkins/build/last', jobName),
  getJenkinsBuildHistory:(jobName) => apiClient.post('/jenkins/build/history', jobName),
  getJenkinsQueueInfo:() => apiClient.get('/jenkins/queue'),
  getJenkinsLogs:(jenkinsData) =>apiClient.post('/jenkins/logs', jenkinsData),
  analyzePipeline:(jenkinsData) => apiClient.post('/pipeline/analyze',jenkinsData),
  chatWithAnalysis:(messageData) => apiClient.post("/chat",messageData),
  // Device Management APIs
 getSonarQubeStats: () => apiClient.get('/sonarqube/stats'),
};