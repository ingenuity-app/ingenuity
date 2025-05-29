# Ingenuity

Ingenuity is an open-source platform that makes advanced AI accessible to everyone—students, researchers, and developers alike. With free access to cutting-edge models, we empower you to explore, create, and innovate responsibly.

**Craft intelligence. Inspire innovation.**  
A powerful AI platform offering free token generation and inference—forever.

---

## Models Used

These models are accessible via the Together API, ensuring free token generation for all users.

[![Gemini 1.5 Flash](https://img.shields.io/badge/Gemini%201.5%20Flash-4A90E2?style=flat-square)](https://ai.google.dev/models/gemini)
[![Qwen-3-235B](https://img.shields.io/badge/Qwen--3--235B-4A90E2?style=flat-square)](https://huggingface.co/Qwen/Qwen-3-235B)
[![LLaMA 3.3 70B](https://img.shields.io/badge/LLaMA--3.3--70B-4A90E2?style=flat-square)](https://ai.meta.com/blog/llama-3/)
[![DeepSeek R1](https://img.shields.io/badge/DeepSeek--R1--LLaMA--70B-4A90E2?style=flat-square)](https://huggingface.co/deepseek-ai/Deep-${System.currentDateTime}Seek-R1-Distill-Llama-70B-free)

---

## Build with Ease

Ingenuity empowers you to build AI applications with ease. Use our streamlined Node.js web interface for quick prototyping, or leverage the high-performance C++ client for advanced workflows—perfect for rapid development, testing, and deployment.

### Architecture

* **Web Interface**: Node.js + Express (`server.js`, `template/`)
* **C++ Client**: Native high-performance library (`cpp-client/`)
* **Templates**: Modular HTML/CSS components (`template/`)

---

## Getting Started

### Web Interface

**Requirements**

* Node.js (v14 or higher)
* npm

**Installation**

```bash
npm install express cors dotenv axios
```

**Configuration**

Create a `.env` file with your API key:

```
TOGETHER_API_KEY=your_api_key_here
```

**Run**

```bash
node server.js
```

Access the interface at [http://localhost:3000](http://localhost:3000)

#### Quick Example

After setting up the web interface, try generating a response:

1. Open [http://localhost:3000](http://localhost:3000)
2. Enter a prompt like "Explain quantum computing in simple terms."
3. Select a model (e.g., DeepSeek R1) and see the response in seconds!

---

### C++ Client

```bash
cd cpp-client
mkdir build && cd build
cmake ..
make
./ingenuity_cpp_client
```

For full usage, refer to [`cpp-client/README.md`](cpp-client/README.md).

---

## Testing Scope

The following components are subject to active testing and validation (status: all tests passing as of June 2025):

* Web UI pages and navigation (`template/` folder)
* API endpoints:
  * `POST /api/generate`
  * `GET /api/generate`
  * `POST /api/gemini`
* Rate limiting and input validation
* Streaming response behavior and fallback mechanisms

---

## Troubleshooting

* Confirm all dependencies are installed
* Ensure `.env` is correctly configured
* Make sure port 3000 is not in use
* Review terminal output for diagnostic messages

---

## Security Features

Ingenuity is built with security best practices:

* API key encryption
* Fair-use rate limiting
* Dependency and typo-squatting checks
* Content Security Policy (CSP)
* Input validation and sanitization
* Hardened HTTP headers

---

## Community

Ingenuity thrives on collaboration. Join our community to share ideas, ask questions, and build the future of AI together. Connect with us on [GitHub Discussions](https://github.com/orgs/ingenuity-app/discussions) or follow updates on [X](https://x.com/ingenuity-app).


---

## Contributing

We welcome contributions:

1. Fork the repository
2. Create a new feature branch
3. Commit and test your changes
4. Submit a pull request

> Note: If Vercel flags commit email issues, ensure your local Git email matches your GitHub account.

---

## License

[MIT License](LICENSE)

---

<details>
<summary>Privacy and Data Practices</summary>

Last Update: June 2, 2025

Ingenuity prioritizes your privacy. We do not sell or share your personal information for targeted advertising. Learn more in our [Privacy Policy](privacy-policy.md).
</details>

**Ingenuity** — Where code meets creativity.