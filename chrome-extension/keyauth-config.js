// KeyAuth Configuration
const KEYAUTH_CONFIG = {
  name: "futbot", // Your KeyAuth application name
  ownerid: "j5oBWrvrnm", // Replace with your KeyAuth owner ID
  secret: "71d7d7717aea788ae29b063fab062482e707ae9826c1e425acffaa7cd816dfc5", // Replace with your KeyAuth secret
  version: "1.0.0",
  url: "https://keyauth.win/api/1.2/" // KeyAuth API endpoint
};

// KeyAuth API endpoints
const KEYAUTH_ENDPOINTS = {
  INIT: "?type=init",
  LOGIN: "?type=login",
  REGISTER: "?type=register",
  LICENSE: "?type=license",
  UPGRADE: "?type=upgrade",
  DOWNLOAD: "?type=file",
  CHAT: "?type=chatget",
  ONLINE: "?type=online",
  LOG: "?type=log"
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KEYAUTH_CONFIG, KEYAUTH_ENDPOINTS };
}

// Export for browser
if (typeof window !== 'undefined') {
  window.KEYAUTH_CONFIG = KEYAUTH_CONFIG;
  window.KEYAUTH_ENDPOINTS = KEYAUTH_ENDPOINTS;
}
