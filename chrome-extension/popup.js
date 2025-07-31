let isActive = false;

// UI Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const startButton = document.getElementById('start-bot');
const stopButton = document.getElementById('stop-bot');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const logoutButton = document.getElementById('logout');
const coinsEarned = document.getElementById('coins-earned');
const tradesMade = document.getElementById('trades-made');

// Check login status on popup open
chrome.storage.local.get(['user', 'isActive'], (data) => {
  if (data.user) {
    showDashboard();
    updateStatus(data.isActive);
  } else {
    showLogin();
  }
});

// Login form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    // Call your authentication API
    const response = await fetch('https://qdvtrvfezpkiertyuida.supabase.co/auth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.VITE_SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) throw new Error('Login failed');
    
    const user = await response.json();
    chrome.storage.local.set({ user });
    showDashboard();
  } catch (error) {
    alert('Login failed. Please check your credentials.');
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
  chrome.storage.local.remove(['user', 'isActive'], () => {
    showLogin();
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