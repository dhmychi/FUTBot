// Import KeyAuth service
importScripts('keyauth-config.js', 'keyauth-service.js');

let isActive = false;
let subscription = null;
let keyAuthService = null;

// Initialize KeyAuth service
async function initializeKeyAuth() {
  if (!keyAuthService) {
    keyAuthService = new KeyAuthService();
  }
  return keyAuthService;
}

// Check subscription status using KeyAuth
async function checkSubscription() {
  try {
    const keyAuth = await initializeKeyAuth();
    const result = await keyAuth.checkSubscription();
    
    if (result.success) {
      subscription = result.subscription;
      return {
        success: true,
        subscription: result.subscription,
        userInfo: result.userInfo,
        expiryDate: result.expiryDate
      };
    } else {
      subscription = null;
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Subscription check failed:', error);
    subscription = null;
    return { success: false, error: error.message };
  }
}

// Authenticate user with KeyAuth
async function authenticateUser(credentials) {
  try {
    const keyAuth = await initializeKeyAuth();
    let result;

    if (credentials.licenseKey) {
      // Login with license key
      result = await keyAuth.loginWithLicense(credentials.licenseKey);
    } else if (credentials.username && credentials.password) {
      // Login with username/password
      result = await keyAuth.login(credentials.username, credentials.password);
    } else {
      throw new Error('Invalid credentials provided');
    }

    if (result.success) {
      subscription = result.subscription?.[0] || null;
      return {
        success: true,
        userInfo: result.userInfo,
        subscription: subscription
      };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Authentication failed:', error);
    return { success: false, error: error.message };
  }
}

// Logout user
async function logoutUser() {
  try {
    const keyAuth = await initializeKeyAuth();
    await keyAuth.logout();
    subscription = null;
    isActive = false;
    await chrome.storage.local.set({ isActive: false });
    return { success: true };
  } catch (error) {
    console.error('Logout failed:', error);
    return { success: false, error: error.message };
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    switch (request.type) {
      case 'AUTHENTICATE':
        const authResult = await authenticateUser(request.credentials);
        sendResponse(authResult);
        break;
        
      case 'CHECK_SUBSCRIPTION':
        const subResult = await checkSubscription();
        sendResponse(subResult);
        break;
        
      case 'START_BOT':
        // Check subscription before starting
        const checkResult = await checkSubscription();
        if (!checkResult.success) {
          sendResponse({ success: false, error: checkResult.error });
          return;
        }
        
        isActive = true;
        await chrome.storage.local.set({ isActive });
        
        // Send message to content script to start bot
        const tabs = await chrome.tabs.query({ url: "https://*.ea.com/*" });
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'START_BOT' });
        }
        
        sendResponse({ success: true });
        break;
        
      case 'STOP_BOT':
        isActive = false;
        await chrome.storage.local.set({ isActive });
        
        // Send message to content script to stop bot
        const activeTabs = await chrome.tabs.query({ url: "https://*.ea.com/*" });
        if (activeTabs.length > 0) {
          chrome.tabs.sendMessage(activeTabs[0].id, { type: 'STOP_BOT' });
        }
        
        sendResponse({ success: true });
        break;
        
      case 'CHECK_STATUS':
        const statusResult = await checkSubscription();
        sendResponse({ 
          isActive, 
          subscription: statusResult.success ? statusResult.subscription : null,
          userInfo: statusResult.success ? statusResult.userInfo : null,
          authenticated: statusResult.success
        });
        break;
        
      case 'LOGOUT':
        const logoutResult = await logoutUser();
        sendResponse(logoutResult);
        break;
    }
  })();
  
  // Return true to indicate we'll send a response asynchronously
  return true;
});

// Initialize state
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ 
    isActive: false,
    stats: {
      coinsEarned: 0,
      tradesMade: 0
    }
  });
});