(function() {
  'use strict';

  // Check if ChatBase is already loaded
  if (window.ChatBase) {
    return;
  }

  // Configuration
  const config = window.chatbaseConfig || {};
  const chatbotId = config.chatbotId;
  const domain = config.domain || window.location.origin;

  if (!chatbotId) {
    console.error('ChatBase: chatbotId is required');
    return;
  }

  // Create ChatBase object
  window.ChatBase = {
    init: init,
    open: open,
    close: close,
    toggle: toggle,
    isOpen: false
  };

  let chatWidget = null;
  let chatFrame = null;
  let chatButton = null;
  let sessionId = generateSessionId();

  function generateSessionId() {
    return 'cb_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  function init() {
    // Create chat button
    createChatButton();
    
    // Create chat widget
    createChatWidget();
    
    // Add event listeners
    addEventListeners();
  }

  function createChatButton() {
    chatButton = document.createElement('div');
    chatButton.id = 'chatbase-button';
    chatButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.4183 21 12 21C10.8717 20.9999 9.75857 20.7572 8.72857 20.2857L3 21L4.71429 15.2714C4.24275 14.2414 4.00007 13.1283 4 12C4 7.58172 8.58172 3 12 3C16.4183 3 21 7.58172 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
      // Styles
    Object.assign(chatButton.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '60px',
      height: '60px',
      backgroundColor: '#3B82F6',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: '1000',
      color: 'white',
      transition: 'all 0.3s ease'
    });

    // Hover effect
    chatButton.addEventListener('mouseenter', function() {
      chatButton.style.transform = 'scale(1.1)';
    });

    chatButton.addEventListener('mouseleave', function() {
      chatButton.style.transform = 'scale(1)';
    });

    document.body.appendChild(chatButton);
  }

  function createChatWidget() {
    chatWidget = document.createElement('div');
    chatWidget.id = 'chatbase-widget';
      Object.assign(chatWidget.style, {
      position: 'fixed',
      bottom: '90px',
      right: '20px',
      width: '350px',
      height: '500px',
      zIndex: '1001',
      display: 'none',
      borderRadius: '12px',
      boxShadow: '0 5px 40px rgba(0, 0, 0, 0.16)',
      overflow: 'hidden'
    });

    // Create iframe
    chatFrame = document.createElement('iframe');
    chatFrame.src = `${domain}/chat/${chatbotId}?embedded=true&sessionId=${sessionId}`;
    chatFrame.style.width = '100%';
    chatFrame.style.height = '100%';
    chatFrame.style.border = 'none';
    chatFrame.style.borderRadius = '12px';

    chatWidget.appendChild(chatFrame);
    document.body.appendChild(chatWidget);
  }

  function addEventListeners() {
    chatButton.addEventListener('click', toggle);
    
    // Close when clicking outside
    document.addEventListener('click', function(event) {
      if (window.ChatBase.isOpen && 
          !chatWidget.contains(event.target) && 
          !chatButton.contains(event.target)) {
        close();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && window.ChatBase.isOpen) {
        close();
      }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
      if (window.innerWidth < 768) {
        // Mobile responsive
        Object.assign(chatWidget.style, {
          bottom: '0',
          right: '0',
          left: '0',
          width: '100%',
          height: '100%',
          borderRadius: '0'
        });
      } else {
        // Desktop
        Object.assign(chatWidget.style, {
          bottom: '90px',
          right: '20px',
          left: 'auto',
          width: '350px',
          height: '500px',
          borderRadius: '12px'
        });
      }
    });
  }

  function open() {
    chatWidget.style.display = 'block';
    window.ChatBase.isOpen = true;
    
    // Animation
    chatWidget.style.opacity = '0';
    chatWidget.style.transform = 'translateY(20px)';
    
    setTimeout(function() {
      chatWidget.style.transition = 'all 0.3s ease';
      chatWidget.style.opacity = '1';
      chatWidget.style.transform = 'translateY(0)';
    }, 10);
  }

  function close() {
    chatWidget.style.transition = 'all 0.3s ease';
    chatWidget.style.opacity = '0';
    chatWidget.style.transform = 'translateY(20px)';
    
    setTimeout(function() {
      chatWidget.style.display = 'none';
      window.ChatBase.isOpen = false;
    }, 300);
  }

  function toggle() {
    if (window.ChatBase.isOpen) {
      close();
    } else {
      open();
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
