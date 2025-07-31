// Trading bot logic
class FUTBot {
  constructor() {
    this.isRunning = false;
    this.stats = {
      coinsEarned: 0,
      tradesMade: 0
    };
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    while (this.isRunning) {
      try {
        await this.performTrading();
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Trading error:', error);
      }
    }
  }

  stop() {
    this.isRunning = false;
  }

  async performTrading() {
    // Trading logic will be implemented here
    // This is just a placeholder for now
    console.log('Trading cycle running...');
  }

  updateStats(coins, trades) {
    this.stats.coinsEarned += coins;
    this.stats.tradesMade += trades;
    
    chrome.storage.local.set({ stats: this.stats });
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