// API Configuration for the application
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://inmobimobi-432699600461.northamerica-south1.run.app' 
  : 'http://localhost:4000';

export default {
  // Base URL for API requests
  baseURL: API_BASE_URL,
  
  // Auth endpoints
  auth: {
    login: `${API_BASE_URL}/api/login`,
    register: `${API_BASE_URL}/api/register`,
    logout: `${API_BASE_URL}/api/logout`,
    currentUser: `${API_BASE_URL}/api/user`,
  },
  
  // Other endpoints can be added here as needed
  properties: {
    list: `${API_BASE_URL}/api/properties`,
    detail: (id) => `${API_BASE_URL}/api/properties/${id}`,
    create: `${API_BASE_URL}/api/properties`,
    update: (id) => `${API_BASE_URL}/api/properties/${id}`,
    delete: (id) => `${API_BASE_URL}/api/properties/${id}`,
  },
  
  // Verification endpoints
  verification: {
    start: `${API_BASE_URL}/api/verification/start`,
    check: `${API_BASE_URL}/api/verification/check`,
    complete: `${API_BASE_URL}/api/verification/complete`,
  },
}; 