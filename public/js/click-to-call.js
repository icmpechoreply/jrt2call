class ClickToCall {
  constructor(config) {
    this.config = {
      apiUrl: config.apiUrl,
      token: config.token,
      containerId: config.containerId || 'click-to-call',
      theme: config.theme || 'light'
    };

    this.state = {
      isOpen: false,
      isCallActive: false,
      currentCallId: null,
      statusCheckInterval: null
    };

    this.init();
  }

  init() {
    // Create and inject HTML
    this.createHTML();
    
    // Add event listeners
    this.addEventListeners();
    
    // Initialize the UI state
    this.updateUIState();
  }

  createHTML() {
    const container = document.getElementById(this.config.containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="c2c-container ${this.config.theme}">
        <button class="c2c-toggle">
          <span class="c2c-icon">📞</span>
        </button>
        
        <div class="c2c-dialog">
          <div class="c2c-header">
            <h3>Click to Call</h3>
            <button class="c2c-close">×</button>
          </div>
          
          <div class="c2c-body">
            <div class="c2c-status"></div>
            
            <div class="c2c-dialpad">
              <div class="c2c-row">
                <button data-digit="1">1</button>
                <button data-digit="2">2</button>
                <button data-digit="3">3</button>
              </div>
              <div class="c2c-row">
                <button data-digit="4">4</button>
                <button data-digit="5">5</button>
                <button data-digit="6">6</button>
              </div>
              <div class="c2c-row">
                <button data-digit="7">7</button>
                <button data-digit="8">8</button>
                <button data-digit="9">9</button>
              </div>
              <div class="c2c-row">
                <button data-digit="*">*</button>
                <button data-digit="0">0</button>
                <button data-digit="#">#</button>
              </div>
            </div>
            
            <div class="c2c-controls">
              <button class="c2c-call">Call</button>
              <button class="c2c-hangup" style="display: none;">End Call</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add styles
    this.addStyles();
  }

  addStyles() {
    const styles = `
      .c2c-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .c2c-toggle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #007bff;
        border: none;
        color: white;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        transition: transform 0.2s;
      }

      .c2c-toggle:hover {
        transform: scale(1.1);
      }

      .c2c-dialog {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 300px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        display: none;
      }

      .c2c-dialog.open {
        display: block;
      }

      .c2c-header {
        padding: 15px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .c2c-header h3 {
        margin: 0;
        font-size: 18px;
      }

      .c2c-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
      }

      .c2c-body {
        padding: 15px;
      }

      .c2c-status {
        text-align: center;
        margin-bottom: 15px;
        min-height: 20px;
        color: #666;
      }

      .c2c-dialpad {
        margin-bottom: 20px;
      }

      .c2c-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }

      .c2c-row button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 1px solid #ddd;
        background: white;
        font-size: 24px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .c2c-row button:hover {
        background-color: #f5f5f5;
      }

      .c2c-controls {
        display: flex;
        justify-content: center;
      }

      .c2c-call, .c2c-hangup {
        padding: 10px 30px;
        border-radius: 25px;
        border: none;
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
        transition: background-color 0.2s;
      }

      .c2c-call {
        background: #28a745;
        color: white;
      }

      .c2c-hangup {
        background: #dc3545;
        color: white;
      }

      .c2c-call:hover {
        background: #218838;
      }

      .c2c-hangup:hover {
        background: #c82333;
      }

      /* Dark theme */
      .c2c-container.dark .c2c-dialog {
        background: #2c2c2c;
        color: white;
      }

      .c2c-container.dark .c2c-header {
        border-color: #444;
      }

      .c2c-container.dark .c2c-row button {
        background: #3c3c3c;
        border-color: #444;
        color: white;
      }

      .c2c-container.dark .c2c-row button:hover {
        background: #4c4c4c;
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  addEventListeners() {
    const container = document.getElementById(this.config.containerId);
    if (!container) return;

    // Toggle dialog
    container.querySelector('.c2c-toggle').addEventListener('click', () => {
      this.toggleDialog();
    });

    // Close dialog
    container.querySelector('.c2c-close').addEventListener('click', () => {
      this.closeDialog();
    });

    // Dialpad buttons
    container.querySelectorAll('.c2c-row button').forEach(button => {
      button.addEventListener('click', () => {
        const digit = button.getAttribute('data-digit');
        if (this.state.isCallActive) {
          this.sendDTMF(digit);
        }
      });
    });

    // Call button
    container.querySelector('.c2c-call').addEventListener('click', () => {
      this.initiateCall();
    });

    // Hangup button
    container.querySelector('.c2c-hangup').addEventListener('click', () => {
      this.endCall();
    });
  }

  async initiateCall() {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/calls/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.token}`
        },
        body: JSON.stringify({
          phoneNumber: this.config.phoneNumber
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        this.state.isCallActive = true;
        this.state.currentCallId = data.data.callId;
        this.updateUIState();
        this.startStatusCheck();
      } else {
        this.showError('Failed to initiate call');
      }
    } catch (error) {
      this.showError('Failed to connect to service');
    }
  }

  async endCall() {
    if (!this.state.currentCallId) return;

    try {
      const response = await fetch(`${this.config.apiUrl}/api/calls/end/${this.state.currentCallId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`
        }
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        this.state.isCallActive = false;
        this.state.currentCallId = null;
        this.stopStatusCheck();
        this.updateUIState();
      } else {
        this.showError('Failed to end call');
      }
    } catch (error) {
      this.showError('Failed to connect to service');
    }
  }

  async sendDTMF(digit) {
    if (!this.state.currentCallId) return;

    try {
      await fetch(`${this.config.apiUrl}/api/calls/dtmf/${this.state.currentCallId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.token}`
        },
        body: JSON.stringify({ digit })
      });
    } catch (error) {
      this.showError('Failed to send DTMF');
    }
  }

  startStatusCheck() {
    this.state.statusCheckInterval = setInterval(() => {
      this.checkCallStatus();
    }, 2000);
  }

  stopStatusCheck() {
    if (this.state.statusCheckInterval) {
      clearInterval(this.state.statusCheckInterval);
      this.state.statusCheckInterval = null;
    }
  }

  async checkCallStatus() {
    if (!this.state.currentCallId) return;

    try {
      const response = await fetch(`${this.config.apiUrl}/api/calls/status/${this.state.currentCallId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.token}`
        }
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        this.updateStatus(data.data.status);
        
        if (['ended', 'failed'].includes(data.data.status)) {
          this.state.isCallActive = false;
          this.state.currentCallId = null;
          this.stopStatusCheck();
          this.updateUIState();
        }
      }
    } catch (error) {
      this.showError('Failed to check call status');
    }
  }

  updateStatus(status) {
    const statusElement = document.querySelector('.c2c-status');
    if (statusElement) {
      statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    }
  }

  showError(message) {
    const statusElement = document.querySelector('.c2c-status');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.style.color = '#dc3545';
      setTimeout(() => {
        statusElement.style.color = '#666';
        statusElement.textContent = '';
      }, 3000);
    }
  }

  toggleDialog() {
    this.state.isOpen = !this.state.isOpen;
    this.updateUIState();
  }

  closeDialog() {
    this.state.isOpen = false;
    this.updateUIState();
  }

  updateUIState() {
    const dialog = document.querySelector('.c2c-dialog');
    const callButton = document.querySelector('.c2c-call');
    const hangupButton = document.querySelector('.c2c-hangup');
    
    if (dialog) {
      dialog.classList.toggle('open', this.state.isOpen);
    }
    
    if (callButton && hangupButton) {
      callButton.style.display = this.state.isCallActive ? 'none' : 'block';
      hangupButton.style.display = this.state.isCallActive ? 'block' : 'none';
    }
  }
}

// Export for both browser and module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClickToCall;
} else {
  window.ClickToCall = ClickToCall;
} 