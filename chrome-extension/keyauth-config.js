// KeyAuth Configuration
const KEYAUTH_CONFIG = {
  name: "FUTBot", // Your KeyAuth application name
  ownerid: "YOUR_OWNER_ID", // Replace with your KeyAuth owner ID
  secret: "YOUR_SECRET_KEY", // Replace with your KeyAuth secret
  version: "1.0.0", // Your application version
  url: "https://keyauth.win/api/1.2/", // KeyAuth API endpoint
};

// KeyAuth API endpoints
const KEYAUTH_ENDPOINTS = {
  INIT: "init",
  LOGIN: "login", 
  REGISTER: "register",
  LICENSE: "license",
  CHECK_SESSION: "check"
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KEYAUTH_CONFIG, KEYAUTH_ENDPOINTS };
} else {
  window.KEYAUTH_CONFIG = KEYAUTH_CONFIG;
  window.KEYAUTH_ENDPOINTS = KEYAUTH_ENDPOINTS;
}
