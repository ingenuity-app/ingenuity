// Cookie Consent Management
document.addEventListener('DOMContentLoaded', () => {
    const cookieConsent = document.getElementById('cookie-consent');
    const acceptButton = document.getElementById('cookie-accept');
    const declineButton = document.getElementById('cookie-decline');
    
    // Check if user has already made a choice
    const cookieChoice = getCookie('cookie_consent');
    
    if (!cookieChoice) {
        // Show the cookie consent banner with animation
        setTimeout(() => {
            cookieConsent.classList.add('visible');
        }, 1000); // Delay showing the banner for 1 second
    }
    
    // Handle accept button click
    acceptButton.addEventListener('click', () => {
        setCookie('cookie_consent', 'accepted', 365); // Store for 1 year
        hideCookieBanner();
    });
    
    // Handle decline button click
    declineButton.addEventListener('click', () => {
        setCookie('cookie_consent', 'declined', 365); // Store for 1 year
        hideCookieBanner();
    });
    
    // Function to hide the cookie banner with animation
    function hideCookieBanner() {
        cookieConsent.classList.remove('visible');
        setTimeout(() => {
            cookieConsent.style.display = 'none';
        }, 300);
    }
    
    // Function to set a cookie
    function setCookie(name, value, days) {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + value + expires + '; path=/; SameSite=Lax';
    }
    
    // Function to get a cookie value
    function getCookie(name) {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
});
