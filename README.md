# Ingenuity

A clean interface for interacting with advanced AI language models from various providers.

## Features

- Multi-Model Access: Interface with different AI models through a unified UI
- Clean Interface: Responsive design that works across devices
- Real-time Streaming: Stream responses as they're generated
- API Key Management: Securely store and manage provider API keys

## Available Models

| Model | Provider | API Key Required |
|-------|----------|-------------------|
| [Gemini 2.0 Flash](https://ai.google.dev/models/gemini) | Google AI | Yes |
| [Qwen-3-235B](https://huggingface.co/Qwen/Qwen-3-235B) | Together AI | Yes |
| [LLaMA 3.3 70B](https://ai.meta.com/blog/llama-3/) | Together AI | Yes |
| [DeepSeek R1](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-70B) | Together AI | Yes |

## Quick Start

```bash
git clone https://github.com/bniladridas/ingenuity.git
cd ingenuity
npm install
npm start
```

Access at `http://localhost:3000`

## Configuration

1. Create `.env` file with your API keys:
   ```
   GEMINI_API_KEY=your_gemini_key       # For Google Gemini
   TOGETHER_API_KEY=your_together_key   # For Qwen, LLaMA, and DeepSeek
   ```

## Implementation Details

- **Frontend**: Vanilla JavaScript with modern ES6+ features
- **Backend**: Node.js with Express server
- **Styling**: Custom CSS with responsive design
- **Dependencies**: Express, CORS, dotenv, axios, @google/genai

## Security

- API keys are stored in browser's localStorage
- Rate limiting (10 requests per minute)
- Input validation and sanitization
- No server-side storage of conversations

## License

MIT License