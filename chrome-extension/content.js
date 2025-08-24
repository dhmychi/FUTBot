// Trading bot logic
class FUTBot {
  constructor() {
    this.isRunning = false;
    this.isAuthenticated = false;
    this.subscriptionValid = false;
    this.stats = {
      coinsEarned: 0,
      tradesMade: 0
    };
    this.lastSubscriptionCheck = 0;
    this.subscriptionCheckInterval = 5 * 60 * 1000; // Check every 5 minutes
  }

  // Validate subscription before starting
  async validateSubscription() {
    try {
      // Check if we need to validate subscription
      const now = Date.now();
      if (now - this.lastSubscriptionCheck < this.subscriptionCheckInterval && this.subscriptionValid) {
        return true;
      }

      // Send message to background script to check subscription
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'CHECK_SUBSCRIPTION' }, resolve);
      });

      this.lastSubscriptionCheck = now;
      this.subscriptionValid = response && response.success;
      this.isAuthenticated = this.subscriptionValid;

      if (!this.subscriptionValid) {
        console.warn('Subscription validation failed:', response?.error);
        this.showSubscriptionWarning(response?.error || 'Invalid subscription');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Subscription validation error:', error);
      this.subscriptionValid = false;
      this.isAuthenticated = false;
      return false;
    }
  }

  async start() {
    if (this.isRunning) return;

    // Validate subscription before starting
    const isValid = await this.validateSubscription();
    if (!isValid) {
      this.showError('Cannot start bot: Invalid or expired subscription');
      return;
    }

    this.isRunning = true;
    this.showSuccess('FUTBot started successfully');
    
    while (this.isRunning) {
      try {
        // Periodic subscription check during operation
        if (Date.now() - this.lastSubscriptionCheck > this.subscriptionCheckInterval) {
          const stillValid = await this.validateSubscription();
          if (!stillValid) {
            this.stop();
            this.showError('Bot stopped: Subscription expired or invalid');
            break;
          }
        }

        await this.performTrading();
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Trading error:', error);
        // Continue running unless it's a subscription error
      }
    }
  }

  stop() {
    this.isRunning = false;
  }

  async performTrading() {
    // Only proceed if subscription is valid
    if (!this.subscriptionValid) {
      console.warn('Trading blocked: Invalid subscription');
      return;
    }

    // Trading logic will be implemented here
    // This is just a placeholder for now
    console.log('Trading cycle running...');
    
    // Simulate some trading activity for demo
    if (Math.random() > 0.8) {
      const coinsEarned = Math.floor(Math.random() * 1000) + 100;
      this.updateStats(coinsEarned, 1);
    }
  }

  updateStats(coins, trades) {
    this.stats.coinsEarned += coins;
    this.stats.tradesMade += trades;
    
    chrome.storage.local.set({ stats: this.stats });
  }

  // UI notification methods
  showError(message) {
    this.createNotification(message, 'error');
  }

  showSuccess(message) {
    this.createNotification(message, 'success');
  }

  showSubscriptionWarning(message) {
    this.createNotification(`⚠️ Subscription Issue: ${message}`, 'warning');
  }

  createNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `futbot-notification futbot-${type}`;
    notification.textContent = message;
    
    // Styling
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      padding: 12px 16px;
      border-radius: 8px;
      color: white;
      font-family: Arial, sans-serif;
      font-size: 14px;
      font-weight: 500;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
      background: ${this.getNotificationColor(type)};
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }

  getNotificationColor(type) {
    const colors = {
      error: 'linear-gradient(135deg, #ff4444, #cc0000)',
      success: 'linear-gradient(135deg, #44ff44, #00cc00)',
      warning: 'linear-gradient(135deg, #ffaa00, #ff8800)',
      info: 'linear-gradient(135deg, #4444ff, #0000cc)'
    };
    return colors[type] || colors.info;
  }
}

const bot = new FUTBot();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'START_BOT':
      bot.start();
      sendResponse({ success: true });
      break;
      
    case 'STOP_BOT':
      bot.stop();
      sendResponse({ success: true });
      break;
  }
});