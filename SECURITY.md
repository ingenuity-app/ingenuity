# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.3   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Ingenuity AI seriously. If you believe you've found a security vulnerability, please follow these steps:
We take the security of Ingenuity seriously. If you believe you've found a security vulnerability, please follow these steps:

1. **Do not disclose the vulnerability publicly**
2. **Contact us through GitHub Issues** with details about the vulnerability
3. Include the following information:
   - Type of vulnerability
   - Full path of the affected file(s)
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (if available)

## What to Expect

- We will acknowledge receipt of your vulnerability report within 48 hours
- We will provide a detailed response about the next steps in handling your report
- We will keep you informed of our progress in addressing the vulnerability
- After the vulnerability is fixed, we will publicly acknowledge your responsible disclosure (unless you prefer to remain anonymous)

## Security Features

Ingenuity includes several security features:

### Slopsquatting Detection

Our platform includes protection against slopsquatting attacks, where malicious packages with names similar to legitimate ones are used to distribute malware. The `security.js` file includes a function to detect suspicious package names in code.

### Content Security Policy

We implement a strict Content Security Policy to prevent cross-site scripting (XSS) attacks and other code injection attacks.

### Input Sanitization

All user inputs are sanitized to prevent injection attacks.

### Rate Limiting

API endpoints are protected with rate limiting to prevent abuse.

### Secure Headers

We use secure HTTP headers to enhance the security of the application.

## Best Practices for Users

- Keep your browser updated to the latest version
- Be cautious when copying and pasting code from external sources
- Verify package names before installing them
- Report any suspicious behavior or security concerns

Thank you for helping keep Ingenuity secure!
