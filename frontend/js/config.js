// Configuration for different environments
const config = {
  development: {
    apiUrl: 'http://localhost:4000',
    wsUrl: 'ws://localhost:4000/ws/connect'
  },
  production: {
    apiUrl: 'https://footoshop-backend.fly.dev',
    wsUrl: 'wss://footoshop-backend.fly.dev/ws/connect'
  }
};

// Detect environment - check if we're on localhost
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.port === '5501';

const currentConfig = isDevelopment ? config.development : config.production;

// Make it globally available
window.API_BASE_URL = currentConfig.apiUrl;
window.WS_URL = currentConfig.wsUrl;

console.log('Environment:', isDevelopment ? 'development' : 'production');
console.log('API URL:', window.API_BASE_URL);
