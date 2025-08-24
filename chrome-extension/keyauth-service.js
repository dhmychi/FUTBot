// KeyAuth Service for Chrome Extension
class KeyAuthService {
  constructor() {
    this.sessionId = null;
    this.userInfo = null;
    this.isInitialized = false;
  }

  // Initialize KeyAuth session
  async init() {
    try {
      const response = await fetch(KEYAUTH_CONFIG.url + KEYAUTH_ENDPOINTS.INIT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          type: KEYAUTH_ENDPOINTS.INIT,
          name: KEYAUTH_CONFIG.name,
          ownerid: KEYAUTH_CONFIG.ownerid,
          secret: KEYAUTH_CONFIG.secret,
          ver: KEYAUTH_CONFIG.version
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.sessionId = data.sessionid;
        this.isInitialized = true;
        return { success: true, sessionId: this.sessionId };
      } else {
        throw new Error(data.message || 'Failed to initialize KeyAuth');
      }
    } catch (error) {
      console.error('KeyAuth init error:', error);
      return { success: false, error: error.message };
    }
  }

  // Login with username and password
  async login(username, password) {
    if (!this.isInitialized) {
      const initResult = await this.init();
      if (!initResult.success) return initResult;
    }

    try {
      const response = await fetch(KEYAUTH_CONFIG.url + KEYAUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          type: KEYAUTH_ENDPOINTS.LOGIN,
          username: username,
          pass: password,
          sessionid: this.sessionId,
          name: KEYAUTH_CONFIG.name,
          ownerid: KEYAUTH_CONFIG.ownerid,
          secret: KEYAUTH_CONFIG.secret,
          ver: KEYAUTH_CONFIG.version
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.userInfo = data.info;
        // Store user session in Chrome storage
        await chrome.storage.local.set({
          keyauth_session: this.sessionId,
          keyauth_user: this.userInfo,
          keyauth_login_time: Date.now()
        });
        
        return { 
          success: true, 
          userInfo: this.userInfo,
          subscription: this.userInfo.subscriptions || []
        };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('KeyAuth login error:', error);
      return { success: false, error: error.message };
    }
  }

  // Login with license key
  async loginWithLicense(licenseKey) {
    if (!this.isInitialized) {
      const initResult = await this.init();
      if (!initResult.success) return initResult;
    }

    try {
      const response = await fetch(KEYAUTH_CONFIG.url + KEYAUTH_ENDPOINTS.LICENSE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          type: KEYAUTH_ENDPOINTS.LICENSE,
          key: licenseKey,
          sessionid: this.sessionId,
          name: KEYAUTH_CONFIG.name,
          ownerid: KEYAUTH_CONFIG.ownerid,
          secret: KEYAUTH_CONFIG.secret,
          ver: KEYAUTH_CONFIG.version
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.userInfo = data.info;
        // Store user session in Chrome storage
        await chrome.storage.local.set({
          keyauth_session: this.sessionId,
          keyauth_user: this.userInfo,
          keyauth_login_time: Date.now()
        });
        
        return { 
          success: true, 
          userInfo: this.userInfo,
          subscription: this.userInfo.subscriptions || []
        };
      } else {
        throw new Error(data.message || 'License validation failed');
      }
    } catch (error) {
      console.error('KeyAuth license error:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user has valid subscription
  async checkSubscription() {
    try {
      const stored = await chrome.storage.local.get(['keyauth_user', 'keyauth_login_time']);
      
      if (!stored.keyauth_user || !stored.keyauth_login_time) {
        return { success: false, error: 'No active session' };
      }

      // Check if session is older than 24 hours
      const sessionAge = Date.now() - stored.keyauth_login_time;
      const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours

      if (sessionAge > maxSessionAge) {
        return { success: false, error: 'Session expired' };
      }

      const userInfo = stored.keyauth_user;
      
      // Check if user has active subscription
      if (userInfo.subscriptions && userInfo.subscriptions.length > 0) {
        const activeSubscription = userInfo.subscriptions.find(sub => {
          const expiry = new Date(sub.expiry * 1000);
          return expiry > new Date();
        });

        if (activeSubscription) {
          return {
            success: true,
            subscription: activeSubscription,
            userInfo: userInfo,
            expiryDate: new Date(activeSubscription.expiry * 1000)
          };
        }
      }

      return { success: false, error: 'No active subscription found' };
    } catch (error) {
      console.error('Subscription check error:', error);
      return { success: false, error: error.message };
    }
  }

  // Logout and clear session
  async logout() {
    try {
      await chrome.storage.local.remove(['keyauth_session', 'keyauth_user', 'keyauth_login_time']);
      this.sessionId = null;
      this.userInfo = null;
      this.isInitialized = false;
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get stored user info
  async getStoredUserInfo() {
    try {
      const stored = await chrome.storage.local.get(['keyauth_user']);
      return stored.keyauth_user || null;
    } catch (error) {
      console.error('Get stored user error:', error);
      return null;
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KeyAuthService;
} else {
  window.KeyAuthService = KeyAuthService;
}
