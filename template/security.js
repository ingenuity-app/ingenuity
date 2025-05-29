// Security utilities for the web interface

// Simple encryption for API keys (not for high-security use cases)
const encryptApiKey = (apiKey, salt = window.location.host) => {
    // This is a simple XOR encryption - for production, use a proper encryption library
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);

    const apply = (func, arr) => Array.prototype.map.call(arr, func);
    const saltChars = textToChars(salt);

    return apply(byteHex, apply((textChar, i) => textChar ^ saltChars[i % saltChars.length], textToChars(apiKey))).join('');
};

// Decrypt the stored API key
const decryptApiKey = (encryptedKey, salt = window.location.host) => {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const saltChars = textToChars(salt);

    return encryptedKey.match(/.{1,2}/g)
        .map(hex => parseInt(hex, 16))
        .map((charCode, i) => charCode ^ saltChars[i % saltChars.length])
        .map(charCode => String.fromCharCode(charCode))
        .join('');
};

// Store API key securely in localStorage
const storeApiKey = (apiKey) => {
    if (!apiKey) return false;

    try {
        const encryptedKey = encryptApiKey(apiKey);
        localStorage.setItem('secureApiKey', encryptedKey);
        return true;
    } catch (error) {
        console.error('Error storing API key:', error);
        return false;
    }
};

// Retrieve API key from localStorage
const getApiKey = () => {
    try {
        const encryptedKey = localStorage.getItem('secureApiKey');
        if (!encryptedKey) return null;

        return decryptApiKey(encryptedKey);
    } catch (error) {
        console.error('Error retrieving API key:', error);
        return null;
    }
};

// Clear stored API key
const clearApiKey = () => {
    try {
        localStorage.removeItem('secureApiKey');
        return true;
    } catch (error) {
        console.error('Error clearing API key:', error);
        return false;
    }
};

// Validate API key format (basic check)
const validateApiKeyFormat = (apiKey) => {
    // Basic validation - adjust based on Together API key format
    return typeof apiKey === 'string' && apiKey.length >= 32;
};

// Input sanitization for prompts
const sanitizeInput = (input) => {
    if (!input) return '';

    // Basic sanitization
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .trim();
};

// Rate limiting helper
const RateLimiter = {
    attempts: {},

    // Check if request should be rate limited
    checkLimit(identifier, maxAttempts = 5, timeWindowMs = 60000) {
        const now = Date.now();

        // Initialize or clean up old attempts
        if (!this.attempts[identifier]) {
            this.attempts[identifier] = [];
        }

        // Remove attempts outside the time window
        this.attempts[identifier] = this.attempts[identifier].filter(
            timestamp => now - timestamp < timeWindowMs
        );

        // Check if over the limit
        if (this.attempts[identifier].length >= maxAttempts) {
            return {
                limited: true,
                waitTime: Math.ceil((timeWindowMs - (now - this.attempts[identifier][0])) / 1000)
            };
        }

        // Record this attempt
        this.attempts[identifier].push(now);

        return {
            limited: false,
            waitTime: 0
        };
    },

    // Reset rate limit for an identifier
    reset(identifier) {
        if (this.attempts[identifier]) {
            delete this.attempts[identifier];
        }
    }
};

// Slopsquatting detection - check for suspicious package imports in code
const detectSuspiciousPackages = (code) => {
    if (!code || typeof code !== 'string') return { safe: true, suspiciousPackages: [] };

    // Common package import patterns in different languages
    const importPatterns = [
        // JavaScript/Node.js
        /(?:import|require)\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
        /import\s+(?:\*\s+as\s+\w+|{\s*[^}]+\s*}|\w+)\s+from\s+['"]([^'"]+)['"]/g,
        // Python
        /import\s+([^\s.;]+)/g,
        /from\s+([^\s.;]+)\s+import/g,
        // Java/Kotlin
        /import\s+([^;]+);/g,
        // Ruby
        /require\s+['"]([^'"]+)['"]/g,
        // Go
        /import\s+(?:\([^)]*["']([^"']+)["'][^)]*\)|["']([^"']+)["'])/g,
    ];

    // Extract all imported package names
    const packageNames = [];
    importPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(code)) !== null) {
            // The captured group might be in different positions depending on the regex
            const packageName = match[1] || match[2] || '';
            if (packageName && !packageName.startsWith('.')) {
                packageNames.push(packageName.split('/')[0]); // Get the root package name
            }
        }
    });

    // Check against a list of known legitimate packages
    // This is a simplified approach - in production, you would use a more comprehensive database
    const commonPackages = [
        // JavaScript
        'react', 'vue', 'angular', 'express', 'axios', 'lodash', 'moment', 'jquery', 'typescript',
        // Python
        'numpy', 'pandas', 'matplotlib', 'tensorflow', 'torch', 'django', 'flask', 'requests', 'scipy',
        // Java
        'java', 'javax', 'org.springframework', 'com.google', 'org.apache', 'android',
        // Go
        'fmt', 'net/http', 'encoding/json', 'io', 'os', 'strings',
        // Ruby
        'rails', 'sinatra', 'nokogiri', 'json', 'httparty'
    ];

    // Identify suspicious packages (those not in our common list)
    const suspiciousPackages = packageNames.filter(pkg =>
        !commonPackages.some(common => pkg.includes(common))
    );

    return {
        safe: suspiciousPackages.length === 0,
        suspiciousPackages: [...new Set(suspiciousPackages)] // Remove duplicates
    };
};

// Export security utilities
window.SecurityUtils = {
    storeApiKey,
    getApiKey,
    clearApiKey,
    validateApiKeyFormat,
    sanitizeInput,
    RateLimiter,
    detectSuspiciousPackages
};
