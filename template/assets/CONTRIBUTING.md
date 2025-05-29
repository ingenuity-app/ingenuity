# Contributing to Ingenuity

Thank you for considering contributing to Ingenuity! This document outlines the process for contributing to the project and how to report issues.

## Code of Conduct

By participating in this project, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue on the GitHub repository with the following information:

1. A clear, descriptive title
2. A detailed description of the issue
3. Steps to reproduce the bug
4. Expected behavior
5. Actual behavior
6. Screenshots (if applicable)
7. Environment information (browser, OS, etc.)

### Suggesting Enhancements

If you have an idea for an enhancement, please create an issue with the following information:

1. A clear, descriptive title
2. A detailed description of the enhancement
3. The motivation behind the enhancement
4. Any potential implementation details you can provide

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes
4. Ensure your code follows the project's coding style
5. Write or update tests as necessary
6. Update documentation as needed
7. Submit a pull request

## Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/bniladridas/ingenuity.git
   cd ingenuity
   ```

2. Install dependencies
   ```bash
   npm install express cors dotenv axios
   ```

3. Create a `.env` file with your Together API key
   ```
   TOGETHER_API_KEY=your_api_key_here
   ```

4. Run the server
   ```bash
   node server.js
   ```

5. Access the application at http://localhost:3000

## Coding Style

- Use consistent indentation (2 spaces)
- Follow JavaScript best practices
- Keep code modular and maintainable
- Comment your code when necessary
- Write clear, descriptive commit messages

## License

By contributing to Ingenuity, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
