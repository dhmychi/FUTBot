// Chrome Extension Subscription Service
class SubscriptionService {
  constructor() {
    this.apiBaseUrl = 'https://your-domain.com/api'; // Replace with your actual API URL
    this.subscriptionPlans = {
      '1-month': { price: '$15.00', duration: 30 },
      '3-months': { price: '$24.99', duration: 90 },
      '12-months': { price: '$49.99', duration: 365 }
    };
  }

  // Show subscription modal in Chrome extension
  showSubscriptionModal() {
    const modal = this.createSubscriptionModal();
    document.body.appendChild(modal);
  }

  // Create subscription modal HTML
  createSubscriptionModal() {
    const modal = document.createElement('div');
    modal.id = 'subscription-modal';
    modal.innerHTML = `
      <div class="subscription-overlay">
        <div class="subscription-modal">
          <div class="modal-header">
            <h2>🚀 Upgrade to Premium</h2>
            <button class="close-btn" onclick="this.closest('#subscription-modal').remove()">×</button>
          </div>
          
          <div class="email-section">
            <label>Email Address:</label>
            <input type="email" id="user-email" placeholder="Enter your email" required>
          </div>
          
          <div class="plans-container">
            <div class="plan-card" data-plan="1-month">
              <h3>1 Month Plan</h3>
              <div class="price">$15.00</div>
              <div class="duration">Monthly billing</div>
              <ul class="features">
                <li>✨ Instant Activation</li>
                <li>⚡ 24/7 Automated Trading</li>
                <li>🎮 Easy Controls</li>
                <li>🔄 Free Updates</li>
                <li>💬 Premium Support</li>
              </ul>
              <button class="subscribe-btn" onclick="subscriptionService.subscribe('1-month')">
                Subscribe Now
              </button>
            </div>
            
            <div class="plan-card popular" data-plan="3-months">
              <div class="popular-badge">Popular</div>
              <h3>3 Months Plan</h3>
              <div class="price">$24.99</div>
              <div class="duration">Quarterly billing</div>
              <ul class="features">
                <li>✨ Instant Activation</li>
                <li>⚡ 24/7 Automated Trading</li>
                <li>🎮 Easy Controls</li>
                <li>🔄 Free Updates</li>
                <li>💬 Premium Support</li>
                <li>💎 Priority Support</li>
              </ul>
              <button class="subscribe-btn" onclick="subscriptionService.subscribe('3-months')">
                Subscribe Now
              </button>
            </div>
            
            <div class="plan-card best-value" data-plan="12-months">
              <div class="best-value-badge">Best Value</div>
              <h3>12 Months Plan</h3>
              <div class="price">$49.99</div>
              <div class="duration">Yearly billing</div>
              <ul class="features">
                <li>✨ Instant Activation</li>
                <li>⚡ 24/7 Automated Trading</li>
                <li>🎮 Easy Controls</li>
                <li>🔄 Free Updates</li>
                <li>💬 24/7 Premium Support</li>
                <li>💎 VIP Support</li>
                <li>🚀 Faster Performance</li>
              </ul>
              <button class="subscribe-btn" onclick="subscriptionService.subscribe('12-months')">
                Subscribe Now
              </button>
            </div>
          </div>
          
          <div class="modal-footer">
            <p>🔒 Secure payment powered by PayPal • Cancel anytime</p>
            <p>After payment, you'll receive your license key via email within minutes.</p>
          </div>
        </div>
      </div>
    `;

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
      .subscription-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .subscription-modal {
        background: #0F1729;
        border-radius: 12px;
        max-width: 900px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        color: white;
        border: 1px solid #4169E1;
      }
      
      .modal-header {
        padding: 20px;
        border-bottom: 1px solid rgba(65, 105, 225, 0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .modal-header h2 {
        margin: 0;
        color: #4169E1;
        font-size: 24px;
      }
      
      .close-btn {
        background: none;
        border: none;
        color: #fff;
        font-size: 24px;
        cursor: pointer;
        padding: 5px;
      }
      
      .email-section {
        padding: 20px;
        border-bottom: 1px solid rgba(65, 105, 225, 0.2);
        background: rgba(65, 105, 225, 0.1);
      }
      
      .email-section label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
      }
      
      .email-section input {
        width: 100%;
        padding: 10px;
        border: 1px solid rgba(65, 105, 225, 0.3);
        border-radius: 6px;
        background: rgba(36, 51, 81, 0.8);
        color: white;
        font-size: 14px;
      }
      
      .plans-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        padding: 20px;
      }
      
      .plan-card {
        background: rgba(65, 105, 225, 0.1);
        border: 2px solid rgba(65, 105, 225, 0.2);
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        position: relative;
        transition: transform 0.2s;
      }
      
      .plan-card:hover {
        transform: translateY(-2px);
      }
      
      .plan-card.popular {
        border-color: #4169E1;
      }
      
      .plan-card.best-value {
        border-color: #10B981;
        background: rgba(16, 185, 129, 0.1);
      }
      
      .popular-badge, .best-value-badge {
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
      }
      
      .popular-badge {
        background: #4169E1;
        color: white;
      }
      
      .best-value-badge {
        background: #10B981;
        color: white;
      }
      
      .plan-card h3 {
        margin: 0 0 10px 0;
        font-size: 18px;
      }
      
      .price {
        font-size: 32px;
        font-weight: bold;
        color: #4169E1;
        margin-bottom: 5px;
      }
      
      .best-value .price {
        color: #10B981;
      }
      
      .duration {
        color: #9CA3AF;
        margin-bottom: 20px;
        font-size: 14px;
      }
      
      .features {
        list-style: none;
        padding: 0;
        margin: 0 0 20px 0;
        text-align: left;
      }
      
      .features li {
        padding: 4px 0;
        font-size: 14px;
      }
      
      .subscribe-btn {
        width: 100%;
        padding: 12px;
        background: #4169E1;
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: bold;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .subscribe-btn:hover {
        background: #1E90FF;
      }
      
      .best-value .subscribe-btn {
        background: #10B981;
      }
      
      .best-value .subscribe-btn:hover {
        background: #059669;
      }
      
      .modal-footer {
        padding: 20px;
        border-top: 1px solid rgba(65, 105, 225, 0.2);
        text-align: center;
        background: rgba(65, 105, 225, 0.05);
      }
      
      .modal-footer p {
        margin: 5px 0;
        font-size: 12px;
        color: #9CA3AF;
      }
    `;
    
    modal.appendChild(style);
    return modal;
  }

  // Handle subscription
  async subscribe(planType) {
    const emailInput = document.getElementById('user-email');
    const userEmail = emailInput?.value;

    if (!userEmail) {
      alert('Please enter your email address');
      return;
    }

    if (!this.isValidEmail(userEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      // Show loading state
      const button = document.querySelector(`[data-plan="${planType}"] .subscribe-btn`);
      const originalText = button.textContent;
      button.textContent = 'Processing...';
      button.disabled = true;

      // Create PayPal subscription
      const response = await fetch(`${this.apiBaseUrl}/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: planType,
          userEmail: userEmail
        })
      });

      const data = await response.json();

      if (data.approvalUrl) {
        // Open PayPal in new tab
        chrome.tabs.create({ url: data.approvalUrl });
        
        // Close the modal
        document.getElementById('subscription-modal')?.remove();
        
        // Show success message
        this.showNotification('Redirecting to PayPal for payment...', 'success');
      } else {
        throw new Error('Failed to create subscription');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      this.showNotification('Failed to create subscription. Please try again.', 'error');
      
      // Reset button
      const button = document.querySelector(`[data-plan="${planType}"] .subscribe-btn`);
      button.textContent = originalText;
      button.disabled = false;
    }
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    const style = document.createElement('style');
    style.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 10001;
        max-width: 300px;
      }
      .notification.success {
        background: #10B981;
      }
      .notification.error {
        background: #DC2626;
      }
      .notification.info {
        background: #4169E1;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 5000);
  }

  // Check if user has premium subscription
  async checkSubscriptionStatus(username) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/check-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username })
      });
      
      const data = await response.json();
      return data.isActive || false;
    } catch (error) {
      console.error('Subscription check error:', error);
      return false;
    }
  }
}

// Initialize service
const subscriptionService = new SubscriptionService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SubscriptionService;
}
