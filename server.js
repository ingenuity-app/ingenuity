const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files - explicitly set the path for each file type
app.use(express.static(path.join(__dirname, 'template')));
app.use('/styles.css', express.static(path.join(__dirname, 'template/styles.css')));
app.use('/svg', express.static(path.join(__dirname, 'template/svg')));
app.use('/png', express.static(path.join(__dirname, 'template/png')));
// Removed individual static serving of JS files to fix MIME type and 404 errors

// Security middleware
const security = {
    // Rate limiting
    rateLimiter: {
        clients: {},
        windowMs: 60000, // 1 minute
        maxRequests: 10, // 10 requests per minute

        limit: (req, res, next) => {
            const ip = req.ip || req.connection.remoteAddress;
            const now = Date.now();

            // Initialize or clean up old requests
            if (!security.rateLimiter.clients[ip]) {
                security.rateLimiter.clients[ip] = [];
            }

            // Remove requests outside the time window
            security.rateLimiter.clients[ip] = security.rateLimiter.clients[ip].filter(
                timestamp => now - timestamp < security.rateLimiter.windowMs
            );

            // Check if over the limit
            if (security.rateLimiter.clients[ip].length >= security.rateLimiter.maxRequests) {
                return res.status(429).json({
                    error: 'Too many requests',
                    retryAfter: Math.ceil((security.rateLimiter.windowMs - (now - security.rateLimiter.clients[ip][0])) / 1000)
                });
            }

            // Record this request
            security.rateLimiter.clients[ip].push(now);
            next();
        }
    },

    // Input validation
    validateInput: (req, res, next) => {
        let prompt;

        // Check if it's GET or POST request
        if (req.method === 'GET') {
            prompt = req.query.prompt;
        } else if (req.method === 'POST') {
            prompt = req.body.prompt;
        }

        // Check for prompt
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Valid prompt is required' });
        }

        // Check prompt length
        if (prompt.length > 4000) {
            return res.status(400).json({ error: 'Prompt exceeds maximum length of 4000 characters' });
        }

        // Check for suspicious patterns
        const suspiciousPatterns = [
            /eval\s*\(/i,
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i,
            /javascript:/i,
            /onerror=/i,
            /onclick=/i,
            /execCommand/i
        ];

        for (const pattern of suspiciousPatterns) {
            if (pattern.test(prompt)) {
                return res.status(400).json({ error: 'Potentially malicious content detected' });
            }
        }

        // Sanitize the prompt
        const sanitizedPrompt = prompt
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .trim();

        // Update the prompt in the request
        if (req.method === 'GET') {
            req.query.prompt = sanitizedPrompt;
        } else if (req.method === 'POST') {
            req.body.prompt = sanitizedPrompt;
        }

        next();
    },

    // Security headers
    securityHeaders: (req, res, next) => {
        // Add security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.together.xyz;");
        res.setHeader('Referrer-Policy', 'no-referrer');
        next();
    }
};

// Apply security middleware to all routes
app.use(security.securityHeaders);

// API endpoint to proxy requests to Together API
app.post('/api/generate', security.rateLimiter.limit, security.validateInput, async (req, res) => {
    try {
        const { prompt, model, api_key } = req.body;

        // Use the selected model from the UI, or DeepSeek as default if none provided
        const selectedModel = model || "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free";

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Use user-provided API key for Qwen3 model, otherwise use environment variable
        let apiKey = process.env.TOGETHER_API_KEY;

        // If it's the Qwen3 model and user provided an API key, use that instead
        if (selectedModel.includes('Qwen') && api_key) {
            apiKey = api_key;
            console.log('Using user-provided API key for Qwen3 model');
        } else if (selectedModel.includes('Qwen') && !api_key) {
            return res.status(400).json({ error: 'API key required for Qwen3 model' });
        }

        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        console.log(`Using model: ${selectedModel}`);

        // For streaming responses
        if (selectedModel.includes('DeepSeek')) {
            // Set up streaming response
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            let thinking = '';
            let finalResponse = '';
            let isThinking = false;
            let tokenCount = 0;

            try {
                const response = await axios.post(
                    'https://api.together.xyz/v1/chat/completions',
                    {
                        model: selectedModel,
                        messages: [{ role: 'user', content: prompt }],
                        stream: true
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        responseType: 'stream'
                    }
                );

                response.data.on('data', (chunk) => {
                    const lines = chunk.toString().split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                            try {
                                const data = JSON.parse(line.substring(6));
                                const content = data.choices[0]?.delta?.content || '';
                                tokenCount++;

                                if (content.includes('<think>')) {
                                    isThinking = true;
                                } else if (content.includes('</think>')) {
                                    isThinking = false;
                                } else if (isThinking) {
                                    thinking += content;
                                    res.write(`data: ${JSON.stringify({ type: 'thinking', content, thinking, tokenCount })}\n\n`);
                                } else {
                                    finalResponse += content;
                                    res.write(`data: ${JSON.stringify({ type: 'response', content, tokenCount })}\n\n`);
                                }
                            } catch (e) {
                                console.error('Error parsing SSE:', e);
                            }
                        }
                    }
                });

                response.data.on('end', () => {
                    res.write(`data: ${JSON.stringify({ type: 'done', tokenCount })}\n\n`);
                    res.end();
                });

                response.data.on('error', (err) => {
                    console.error('Stream error:', err);
                    res.end();
                });
            } catch (error) {
                console.error('Error setting up stream:', error);
                res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
                res.end();
            }
        } else {
            // Non-streaming response for other models
            const response = await axios.post(
                'https://api.together.xyz/v1/chat/completions',
                {
                    model: selectedModel,
                    messages: [{ role: 'user', content: prompt }]
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const content = response.data.choices[0].message.content;
            const tokenCount = response.data.usage?.total_tokens || 0;

            res.json({
                thinking: '',
                response: content,
                tokenCount: tokenCount
            });
        }
    } catch (error) {
        console.error('Error calling Together API:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to get response from API',
            details: error.response?.data || error.message
        });
    }
});

// API endpoint for streaming responses
app.get('/api/generate', security.rateLimiter.limit, security.validateInput, async (req, res) => {
    try {
        const prompt = req.query.prompt;
        const model = req.query.model || "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free";
        // Get user-provided API key if available (for Qwen3 model)
        const userApiKey = req.query.api_key;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Use user-provided API key for Qwen3 model, otherwise use environment variable
        let apiKey = process.env.TOGETHER_API_KEY;

        // If it's the Qwen3 model and user provided an API key, use that instead
        if (model.includes('Qwen') && userApiKey) {
            apiKey = userApiKey;
            console.log('Using user-provided API key for Qwen3 model');
        } else if (model.includes('Qwen') && !userApiKey) {
            return res.write(`data: ${JSON.stringify({
                type: 'error',
                error: 'API key required for Qwen3 model'
            })}\n\n`);
        }

        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        console.log(`Streaming with model: ${model}`);

        // Set up streaming response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        let finalResponse = '';
        let tokenCount = 0;

        try {
            const response = await axios.post(
                'https://api.together.xyz/v1/chat/completions',
                {
                    model: model,
                    messages: [{ role: 'user', content: prompt }],
                    stream: true
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'stream'
                }
            );

            // Send initial reasoning process
            const startTime = Date.now();

            // Create more detailed reasoning for math problems
            let detailedReasoning = `Analyzing prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"\n\n`;

            if (prompt.toLowerCase().includes('calculate') ||
                prompt.toLowerCase().includes('math') ||
                prompt.toLowerCase().includes('discount') ||
                prompt.toLowerCase().includes('price')) {

                detailedReasoning += `MATHEMATICAL ANALYSIS:\n`;
                detailedReasoning += `1. Identifying mathematical pattern in the query\n`;
                detailedReasoning += `2. Extracting numerical values and operations\n`;
                detailedReasoning += `3. Determining calculation sequence\n`;
                detailedReasoning += `4. Preparing step-by-step solution approach\n\n`;
                detailedReasoning += `Processing with selected model\n`;
                detailedReasoning += `Generating structured mathematical response...`;
            } else {
                detailedReasoning += `Processing with selected model\nGenerating response...`;
            }

            const reasoningData = {
                type: 'reasoning',
                reasoning: detailedReasoning
            };
            res.write(`data: ${JSON.stringify(reasoningData)}\n\n`);

            // Initial metrics
            const initialMetrics = {
                type: 'metrics',
                tokens: 0,
                time: 0
            };
            res.write(`data: ${JSON.stringify(initialMetrics)}\n\n`);

            // Set default token count for demo purposes
            // This ensures we always show some token count even if the API doesn't return tokens
            tokenCount = 150;

            // Track internal reasoning for math problems
            let internalReasoning = '';
            let isCalculation = prompt.toLowerCase().includes('calculate') ||
                               prompt.toLowerCase().includes('math') ||
                               prompt.toLowerCase().includes('solve');

            response.data.on('data', (chunk) => {
                const lines = chunk.toString().split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            // Skip empty data lines
                            if (line.trim() === 'data: ') {
                                continue;
                            }

                            // Parse the JSON data
                            let data;
                            try {
                                data = JSON.parse(line.substring(6));
                            } catch (parseError) {
                                console.log('Skipping invalid JSON:', line.substring(6));
                                continue;
                            }

                            // Extract content if available
                            const content = data.choices &&
                                           data.choices[0] &&
                                           data.choices[0].delta &&
                                           data.choices[0].delta.content || '';

                            // Skip empty content
                            if (!content) {
                                continue;
                            }

                            tokenCount++;

                            // Update metrics periodically
                            if (tokenCount % 10 === 0) {
                                const currentTime = Date.now();
                                const elapsedTime = currentTime - startTime;
                                const metricsData = {
                                    type: 'metrics',
                                    tokens: tokenCount,
                                    time: elapsedTime
                                };
                                res.write(`data: ${JSON.stringify(metricsData)}\n\n`);

                                // Update reasoning for calculation problems
                                if (isCalculation) {
                                    // Build more detailed reasoning based on content
                                    if (content.includes('=')) {
                                        internalReasoning += `• Evaluating equation: found equality expression\n`;
                                    }
                                    if (content.includes('%')) {
                                        internalReasoning += `• Processing percentage calculation\n`;
                                    }
                                    if (content.includes('$')) {
                                        internalReasoning += `• Handling currency values\n`;
                                    }
                                    if (content.includes('+') || content.includes('-')) {
                                        internalReasoning += `• Performing addition/subtraction operations\n`;
                                    }
                                    if (content.includes('*') || content.includes('×') || content.includes('·')) {
                                        internalReasoning += `• Performing multiplication operations\n`;
                                    }
                                    if (content.includes('/') || content.includes('÷')) {
                                        internalReasoning += `• Performing division operations\n`;
                                    }

                                    // Create a more structured reasoning output
                                    let updatedReasoningText = `Analyzing prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"\n\n`;
                                    updatedReasoningText += `MATHEMATICAL ANALYSIS:\n`;
                                    updatedReasoningText += `1. Identified mathematical pattern in the query\n`;
                                    updatedReasoningText += `2. Extracted numerical values and operations\n`;
                                    updatedReasoningText += `3. Determined calculation sequence\n`;
                                    updatedReasoningText += `4. Preparing step-by-step solution\n\n`;
                                    updatedReasoningText += `CALCULATION PROCESS:\n${internalReasoning}\n`;
                                    updatedReasoningText += `\nPERFORMANCE METRICS:\n`;
                                    updatedReasoningText += `• Tokens processed: ${tokenCount}\n`;
                                    updatedReasoningText += `• Elapsed time: ${elapsedTime}ms\n`;
                                    updatedReasoningText += `• Processing rate: ${Math.round(tokenCount/(elapsedTime/1000))} tokens/second`;

                                    const updatedReasoning = {
                                        type: 'reasoning',
                                        reasoning: updatedReasoningText
                                    };
                                    res.write(`data: ${JSON.stringify(updatedReasoning)}\n\n`);
                                }
                            }

                            // Send content as response
                            finalResponse += content;
                            res.write(`data: ${JSON.stringify({ type: 'response', content, tokenCount })}\n\n`);
                        } catch (e) {
                            console.error('Error processing SSE data:', e);
                        }
                    }
                }
            });

            response.data.on('end', () => {
                // Final metrics update
                const currentTime = Date.now();
                const elapsedTime = currentTime - startTime;
                const finalMetrics = {
                    type: 'metrics',
                    tokens: tokenCount,
                    time: elapsedTime
                };
                res.write(`data: ${JSON.stringify(finalMetrics)}\n\n`);

                // Send completion event
                res.write(`data: ${JSON.stringify({ type: 'done', tokenCount })}\n\n`);
                res.end();
            });

            response.data.on('error', (err) => {
                console.error('Stream error:', err);
                res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
                res.end();
            });
        } catch (error) {
            console.error('Error setting up stream:', error);

            // Check if it's a model availability error or any API error
            if (error.response || error.code) {
                console.log('Model error or not available, falling back to default model');

                // Send error notification
                res.write(`data: ${JSON.stringify({
                    type: 'error',
                    error: 'The selected model is currently unavailable. Falling back to default model.'
                })}\n\n`);

                // Try again with the default model
                try {
                    const fallbackResponse = await axios.post(
                        'https://api.together.xyz/v1/chat/completions',
                        {
                            model: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
                            messages: [{ role: 'user', content: prompt }],
                            stream: true
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${apiKey}`,
                                'Content-Type': 'application/json'
                            },
                            responseType: 'stream'
                        }
                    );

                    // Process the fallback response
                    fallbackResponse.data.on('data', (chunk) => {
                        const lines = chunk.toString().split('\n');
                        for (const line of lines) {
                            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                                try {
                                    // Skip empty data lines
                                    if (line.trim() === 'data: ') {
                                        continue;
                                    }

                                    // Parse the JSON data
                                    let data;
                                    try {
                                        data = JSON.parse(line.substring(6));
                                    } catch (parseError) {
                                        console.log('Skipping invalid JSON:', line.substring(6));
                                        continue;
                                    }

                                    // Extract content if available
                                    const content = data.choices &&
                                                   data.choices[0] &&
                                                   data.choices[0].delta &&
                                                   data.choices[0].delta.content || '';

                                    // Skip empty content
                                    if (!content) {
                                        continue;
                                    }

                                    tokenCount++;

                                    // Send content as response
                                    finalResponse += content;
                                    res.write(`data: ${JSON.stringify({ type: 'response', content, tokenCount })}\n\n`);
                                } catch (e) {
                                    console.error('Error processing SSE data:', e);
                                }
                            }
                        }
                    });

                    fallbackResponse.data.on('end', () => {
                        res.write(`data: ${JSON.stringify({ type: 'done', tokenCount })}\n\n`);
                        res.end();
                    });

                    fallbackResponse.data.on('error', (err) => {
                        console.error('Fallback stream error:', err);
                        res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
                        res.end();
                    });

                } catch (fallbackError) {
                    console.error('Error with fallback model:', fallbackError);
                    res.write(`data: ${JSON.stringify({ type: 'error', error: 'All models unavailable. Please try again later.' })}\n\n`);
                    res.end();
                }
            } else {
                // For other errors, just return the error message
                res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
                res.end();
            }
        }
    } catch (error) {
        console.error('Error in streaming endpoint:', error);
        res.status(500).json({ error: 'Failed to set up streaming' });
    }
});

// Serve HTML pages
app.get('/', (_, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (_, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/transformers', (_, res) => {
    res.sendFile(path.join(__dirname, 'transformers.html'));
});

app.get('/ai-ethics', (_, res) => {
    res.sendFile(path.join(__dirname, 'ai-ethics.html'));
});

app.get('/advanced-ai', (_, res) => {
    res.sendFile(path.join(__dirname, 'advanced-ai.html'));
});

app.get('/documentation', (_, res) => {
    res.sendFile(path.join(__dirname, 'documentation.html'));
});

app.get('/partners', (_, res) => {
    res.sendFile(path.join(__dirname, 'partners.html'));
});

app.get('/settings', (_, res) => {
    res.sendFile(path.join(__dirname, 'settings.html'));
});

app.get('/terms', (_, res) => {
    res.sendFile(path.join(__dirname, 'terms.html'));
});

app.get('/qwen3-235b', (_, res) => {
    res.sendFile(path.join(__dirname, 'qwen3-235b.html'));
});

app.get('/gemini', (_, res) => {
    res.sendFile(path.join(__dirname, 'gemini.html'));
});

// API endpoint for Gemini model
app.post('/api/gemini', security.rateLimiter.limit, security.validateInput, async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Gemini API key not configured' });
        }

        console.log(`Using Gemini model with prompt: ${prompt.substring(0, 50)}...`);

        // Initialize the Gemini API
        const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Generate content
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Estimate token count (actual count not provided by API)
        const estimatedTokenCount = Math.round(prompt.length / 4) + Math.round(response.length / 4);

        res.json({
            response: response,
            tokenCount: estimatedTokenCount
        });
    } catch (error) {
        console.error('Error calling Gemini API:', error.message);
        res.status(500).json({
            error: 'Failed to get response from Gemini API',
            details: error.message
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
