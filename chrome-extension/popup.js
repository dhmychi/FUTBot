let isActive = false;
let currentUser = null;
let currentSubscription = null;

// UI Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const licenseForm = document.getElementById('license-form');
const startButton = document.getElementById('start-bot');
const stopButton = document.getElementById('stop-bot');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const logoutButton = document.getElementById('logout');
const coinsEarned = document.getElementById('coins-earned');
const tradesMade = document.getElementById('trades-made');
const userInfo = document.getElementById('user-info');
const subscriptionInfo = document.getElementById('subscription-info');
const loginToggle = document.getElementById('login-toggle');
const authTabs = document.querySelectorAll('.auth-tab');

// Check authentication status on popup open
chrome.runtime.sendMessage({ type: 'CHECK_STATUS' }, (response) => {
  if (response && response.authenticated) {
    currentUser = response.userInfo;
    currentSubscription = response.subscription;
    showDashboard();
    updateStatus(response.isActive);
    updateUserInfo();
  } else {
    showLogin();
  }
});

// Authentication tab switching
authTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetForm = tab.dataset.target;
    
    // Update active tab
    authTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Show/hide forms
    document.getElementById('username-login').style.display = 
      targetForm === 'username' ? 'block' : 'none';
    document.getElementById('license-login').style.display = 
      targetForm === 'license' ? 'block' : 'none';
  });
});

// Username/Password login form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (!username || !password) {
    showError('Please enter both username and password');
    return;
  }
  
  setLoading(true);
  
  try {
    chrome.runtime.sendMessage({
      type: 'AUTHENTICATE',
      credentials: { username, password }
    }, (response) => {
      setLoading(false);
      
      if (response && response.success) {
        currentUser = response.userInfo;
        currentSubscription = response.subscription;
        showDashboard();
        updateUserInfo();
        showSuccess('Login successful!');
      } else {
        showError(response?.error || 'Login failed. Please check your credentials.');
      }
    });
  } catch (error) {
    setLoading(false);
    showError('Login failed. Please try again.');
  }
});

// License key login form submission
licenseForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const licenseKey = document.getElementById('license-key').value;
  
  if (!licenseKey) {
    showError('Please enter your license key');
    return;
  }
  
  setLoading(true);
  
  try {
    chrome.runtime.sendMessage({
      type: 'AUTHENTICATE',
      credentials: { licenseKey }
    }, (response) => {
      setLoading(false);
      
      if (response && response.success) {
        currentUser = response.userInfo;
        currentSubscription = response.subscription;
        showDashboard();
        updateUserInfo();
        showSuccess('License activated successfully!');
      } else {
        showError(response?.error || 'Invalid license key. Please check and try again.');
      }
    });
  } catch (error) {
    setLoading(false);
    showError('License validation failed. Please try again.');
  }
});

// Bot controls
startButton.addEventListener('click', async () => {
  chrome.runtime.sendMessage({ type: 'START_BOT' }, (response) => {
    if (response.success) {
      updateStatus(true);
    } else {
      alert(response.error || 'Failed to start bot');
    }
  });
});

stopButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'STOP_BOT' }, (response) => {
    if (response.success) {
      updateStatus(false);
    }
  });
});

logoutButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'LOGOUT' }, (response) => {
    if (response && response.success) {
      currentUser = null;
      currentSubscription = null;
      showLogin();
      showSuccess('Logged out successfully');
    } else {
      showError('Logout failed');
    }
  });
});

// Helper functions
function showDashboard() {
  loginSection.style.display = 'none';
  dashboardSection.style.display = 'block';
  logoutButton.style.display = 'block';
}

function showLogin() {
  loginSection.style.display = 'block';
  dashboardSection.style.display = 'none';
  logoutButton.style.display = 'none';
}

function updateStatus(active) {
  isActive = active;
  statusIndicator.classList.toggle('active', active);
  statusText.textContent = active ? 'Active' : 'Inactive';
  startButton.disabled = active;
  stopButton.disabled = !active;
}

// Update user information display
function updateUserInfo() {
  if (currentUser && userInfo) {
    userInfo.innerHTML = `
      <div class="user-details">
        <h3>Welcome, ${currentUser.username || 'User'}</h3>
        <p>Account: ${currentUser.email || 'N/A'}</p>
      </div>
    `;
  }
  
  if (currentSubscription) {
    const expiryDate = new Date(currentSubscription.expiry * 1000);
    const isExpired = expiryDate < new Date();
    
    subscriptionInfo.innerHTML = `
      <div class="subscription-details ${isExpired ? 'expired' : 'active'}">
        <h4>Subscription Status</h4>
        <p>Plan: ${currentSubscription.subscription || 'Premium'}</p>
        <p>Status: ${isExpired ? 'Expired' : 'Active'}</p>
        <p>Expires: ${expiryDate.toLocaleDateString()}</p>
      </div>
    `;
  }
}

// UI feedback functions
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    background: #ff4444;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    margin: 8px 0;
    font-size: 12px;
  `;
  
  const container = document.querySelector('.active form') || loginSection;
  container.insertBefore(errorDiv, container.firstChild);
  
  setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  successDiv.style.cssText = `
    background: #44ff44;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    margin: 8px 0;
    font-size: 12px;
  `;
  
  const container = dashboardSection.style.display === 'block' ? dashboardSection : loginSection;
  container.insertBefore(successDiv, container.firstChild);
  
  setTimeout(() => successDiv.remove(), 3000);
}

function setLoading(loading) {
  const submitButtons = document.querySelectorAll('button[type="submit"]');
  submitButtons.forEach(button => {
    button.disabled = loading;
    button.textContent = loading ? 'Please wait...' : button.dataset.originalText || button.textContent;
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent;
    }
  });
}

// Update stats periodically
setInterval(() => {
  if (isActive) {
    chrome.storage.local.get('stats', (data) => {
      if (data.stats) {
        coinsEarned.textContent = data.stats.coinsEarned.toLocaleString();
        tradesMade.textContent = data.stats.tradesMade;
      }
    });
  }
}, 1000);