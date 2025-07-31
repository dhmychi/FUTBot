let isActive = false;
let subscription = null;

// Check subscription status
async function checkSubscription(email, token) {
  try {
    const response = await fetch('https://qdvtrvfezpkiertyuida.supabase.co/rest/v1/subscriptions', {
      headers: {
        'apikey': process.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) throw new Error('Failed to verify subscription');
    
    const data = await response.json();
    const userSub = data.find(sub => sub.email === email && sub.is_active);
    
    if (!userSub) throw new Error('No active subscription found');
    
    subscription = userSub;
    return true;
  } catch (error) {
    console.error('Subscription check failed:', error);
    return false;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'START_BOT':
      if (!subscription) {
        sendResponse({ success: false, error: 'No active subscription' });
        return;
      }
      isActive = true;
      chrome.storage.local.set({ isActive });
      sendResponse({ success: true });
      break;
      
    case 'STOP_BOT':
      isActive = false;
      chrome.storage.local.set({ isActive });
      sendResponse({ success: true });
      break;
      
    case 'CHECK_STATUS':
      sendResponse({ isActive, subscription });
      break;
  }
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