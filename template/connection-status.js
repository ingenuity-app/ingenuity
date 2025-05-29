// Internet Connection Status Checker
document.addEventListener('DOMContentLoaded', function() {
    // Create the offline alert element
    const offlineAlert = document.createElement('div');
    offlineAlert.className = 'offline-alert';
    offlineAlert.innerHTML = `
        <div class="offline-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="1" y1="1" x2="23" y2="23"></line>
                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
                <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                <line x1="12" y1="20" x2="12.01" y2="20"></line>
            </svg>
        </div>
        <div class="offline-message">
            <strong>You are offline</strong>
            <p>This application requires an internet connection to function properly. Please check your connection and try again.</p>
        </div>
        <button class="offline-close-button">&times;</button>
    `;
    
    // Add the alert to the body but keep it hidden initially
    document.body.appendChild(offlineAlert);
    
    // Function to check connection status and show/hide alert
    function updateConnectionStatus() {
        if (!navigator.onLine) {
            offlineAlert.classList.add('visible');
        } else {
            offlineAlert.classList.remove('visible');
        }
    }
    
    // Close button functionality
    const closeButton = offlineAlert.querySelector('.offline-close-button');
    closeButton.addEventListener('click', function() {
        offlineAlert.classList.remove('visible');
    });
    
    // Check connection status immediately and when it changes
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    
    // Initial check
    updateConnectionStatus();
    
    // Periodically check connection (every 30 seconds)
    setInterval(updateConnectionStatus, 30000);
    
    // Also check when user interacts with the page
    document.addEventListener('click', function() {
        setTimeout(updateConnectionStatus, 100);
    });
});
