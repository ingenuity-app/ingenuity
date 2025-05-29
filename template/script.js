// DOM Elements
const promptTextarea = document.getElementById('prompt-textarea');
const searchButton = document.getElementById('search-button');
const responseContent = document.getElementById('response-content');
const reasoningContent = document.getElementById('reasoning-content');
const tokenCount = document.getElementById('token-count');
const computationTime = document.getElementById('computation-time');
const loadingIndicator = document.getElementById('loading-indicator');
const modelDropdown = document.getElementById('model-dropdown');

// Question suggestions by topic
const QUESTION_SUGGESTIONS = {
    transformers: [
        "How do transformers handle long-range dependencies?",
        "Explain the self-attention mechanism in transformers",
        "What are the key components of a transformer architecture?",
        "How does positional encoding work in transformers?",
        "Compare RNNs and transformers for sequence modeling",
        "What is multi-head attention and why is it useful?",
        "How do transformer encoders and decoders differ?",
        "What are the limitations of transformer models?",
        "Explain how transformers are trained",
        "How do transformers process sequential data?"
    ],
    ethics: [
        "What are the core principles of responsible AI?",
        "How can we address bias in AI systems?",
        "What is the alignment problem in AI ethics?",
        "Explain the importance of transparency in AI systems",
        "What governance frameworks exist for ethical AI?",
        "How can we ensure AI benefits all of humanity?",
        "What are the privacy concerns with large language models?",
        "How should we approach AI safety research?",
        "What ethical considerations arise with autonomous AI systems?",
        "How can we make AI development more inclusive?"
    ],
    advanced: [
        "What is the difference between narrow AI and AGI?",
        "How do emergent abilities appear in large language models?",
        "What are the key challenges in developing AGI?",
        "Explain the concept of deep artificial intelligence",
        "What safety measures are needed for advanced AI systems?",
        "How might we achieve artificial general intelligence?",
        "What are the scaling laws in AI research?",
        "How do large language models reason?",
        "What is the relationship between model size and capabilities?",
        "How might advanced AI impact society in the future?"
    ],
    general: [
        "How can I use Ingenuity for my research?",
        "What makes Ingenuity different from other platforms?",
        "Explain how token generation works",
        "What educational resources do you recommend for AI beginners?",
        "How can I contribute to responsible AI development?",
        "What are the latest developments in AI research?",
        "How does Ingenuity ensure user privacy?",
        "What computational resources power Ingenuity?",
        "How can I learn more about machine learning?",
        "What are the best practices for prompt engineering?"
    ]
};

// Models (without explicitly mentioning names)
const MODELS = {
    default: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
    alternative: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free" // Using Llama 3.3 70B as alternative
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    createSuggestionsList();

    // Refresh suggestions every 30 seconds
    setInterval(refreshSuggestions, 30000);
});

// Set up event listeners
function setupEventListeners() {
    // Search button click
    searchButton.addEventListener('click', handleSubmit);

    // Enter key in input field
    promptTextarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    });

    // Focus event on input field to show suggestions
    promptTextarea.addEventListener('focus', () => {
        const suggestionsContainer = document.getElementById('suggestions-container');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'block';
            // Add visible class after a small delay to trigger animation
            setTimeout(() => {
                suggestionsContainer.classList.add('visible');
            }, 10);
        }
    });

    // Click outside to hide suggestions
    document.addEventListener('click', (e) => {
        const suggestionsContainer = document.getElementById('suggestions-container');
        const cookieConsent = document.getElementById('cookie-consent');
        if (suggestionsContainer &&
            !suggestionsContainer.contains(e.target) &&
            !(cookieConsent && cookieConsent.contains(e.target)) &&
            e.target !== promptTextarea) {
            // Remove visible class first to trigger animation
            suggestionsContainer.classList.remove('visible');
            // Hide after animation completes
            setTimeout(() => {
                suggestionsContainer.style.display = 'none';
            }, 200);
        }
    });

    // Model dropdown change
    modelDropdown.addEventListener('change', () => {
        // Clear previous response when model is changed
        responseContent.innerHTML = '';
        reasoningContent.innerHTML = '';
        tokenCount.textContent = '0';
        computationTime.textContent = '0';

        // Show a subtle notification that model was changed
        const modelChangeNotification = document.createElement('div');
        modelChangeNotification.className = 'model-change-notification';
        modelChangeNotification.textContent = 'Model preference updated';

        // Add notification to the page
        document.querySelector('.container').insertBefore(
            modelChangeNotification,
            document.querySelector('.input-container')
        );

        // Remove notification after 2 seconds
        setTimeout(() => {
            modelChangeNotification.style.opacity = '0';
            setTimeout(() => modelChangeNotification.remove(), 500);
        }, 2000);
    });
}

// Create and append the suggestions list
function createSuggestionsList() {
    // Create suggestions container
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = 'suggestions-container';
    suggestionsContainer.className = 'suggestions-container';

    // Create suggestions header
    const suggestionsHeader = document.createElement('div');
    suggestionsHeader.className = 'suggestions-header';
    suggestionsHeader.textContent = 'Try asking about:';
    suggestionsContainer.appendChild(suggestionsHeader);

    // Get a mix of suggestions from different categories
    const allSuggestions = [];

    // Add one from each category
    allSuggestions.push(getRandomSuggestion('transformers'));
    allSuggestions.push(getRandomSuggestion('ethics'));
    allSuggestions.push(getRandomSuggestion('advanced'));

    // Add two from general
    allSuggestions.push(getRandomSuggestion('general'));
    allSuggestions.push(getRandomSuggestion('general', allSuggestions[3])); // Ensure different suggestion

    // Create suggestion items
    allSuggestions.forEach(suggestion => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = suggestion;

        // Add click event to fill the input
        suggestionItem.addEventListener('click', () => {
            promptTextarea.value = suggestion;
            suggestionsContainer.classList.remove('visible');
            setTimeout(() => {
                suggestionsContainer.style.display = 'none';
            }, 200);
            promptTextarea.focus();
        });

        suggestionsContainer.appendChild(suggestionItem);
    });

    // Insert after input container
    const inputContainer = document.querySelector('.input-container');
    inputContainer.insertAdjacentElement('afterend', suggestionsContainer);

    // Initially show suggestions
    suggestionsContainer.style.display = 'block';
    suggestionsContainer.classList.add('visible');
}

// Get a random suggestion from a category
function getRandomSuggestion(category, excludeSuggestion = '') {
    const suggestions = QUESTION_SUGGESTIONS[category].filter(s => s !== excludeSuggestion);
    const randomIndex = Math.floor(Math.random() * suggestions.length);
    return suggestions[randomIndex];
}

// Refresh the suggestions with new random questions
function refreshSuggestions() {
    const suggestionsContainer = document.getElementById('suggestions-container');
    if (!suggestionsContainer || suggestionsContainer.style.display === 'none') {
        return; // Don't refresh if not visible
    }

    // Remove old suggestion items
    const oldItems = suggestionsContainer.querySelectorAll('.suggestion-item');
    oldItems.forEach(item => item.remove());

    // Get new suggestions
    const allSuggestions = [];
    allSuggestions.push(getRandomSuggestion('transformers'));
    allSuggestions.push(getRandomSuggestion('ethics'));
    allSuggestions.push(getRandomSuggestion('advanced'));
    allSuggestions.push(getRandomSuggestion('general'));
    allSuggestions.push(getRandomSuggestion('general', allSuggestions[3]));

    // Create new suggestion items
    allSuggestions.forEach(suggestion => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = suggestion;

        // Add click event to fill the input
        suggestionItem.addEventListener('click', () => {
            promptTextarea.value = suggestion;
            suggestionsContainer.classList.remove('visible');
            setTimeout(() => {
                suggestionsContainer.style.display = 'none';
            }, 200);
            promptTextarea.focus();
        });

        suggestionsContainer.appendChild(suggestionItem);
    });
}

// Handle form submission
async function handleSubmit() {
    const prompt = promptTextarea.value.trim();
    const modelKey = modelDropdown.value;
    const model = MODELS[modelKey];

    if (!prompt) {
        alert('Please enter a prompt');
        return;
    }

    // Hide suggestions with animation
    const suggestionsContainer = document.getElementById('suggestions-container');
    if (suggestionsContainer) {
        suggestionsContainer.classList.remove('visible');
        setTimeout(() => {
            suggestionsContainer.style.display = 'none';
        }, 200);
    }

    // Reset UI
    loadingIndicator.style.display = 'flex';
    responseContent.innerHTML = '';
    reasoningContent.innerHTML = '';
    tokenCount.textContent = '0';
    computationTime.textContent = '0';

    // Use streaming response for DeepSeek model
    fetchStreamingResponse(prompt, model);
}

// Fetch streaming response from API
function fetchStreamingResponse(prompt, model) {
    // Create EventSource for server-sent events
    const eventSource = new EventSource(`/api/generate?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(model)}`);

    let responseText = '';

    // Handle incoming events
    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case 'response':
                    // Update response content
                    responseText += data.content || '';
                    displayResponse(responseText);
                    break;

                case 'reasoning':
                    // Update reasoning process
                    if (data.reasoning) {
                        reasoningContent.textContent = data.reasoning;
                    }
                    break;

                case 'metrics':
                    // Update token count and computation time
                    if (data.tokens) {
                        tokenCount.textContent = data.tokens;
                    }
                    if (data.time) {
                        computationTime.textContent = data.time;
                    }
                    break;

                case 'done':
                    // Finalize the response
                    eventSource.close();
                    loadingIndicator.style.display = 'none';
                    break;

                case 'error':
                    // Check if it's a model fallback error
                    if (data.error && data.error.includes('unavailable')) {
                        // Show fallback notification
                        const fallbackNotification = document.createElement('div');
                        fallbackNotification.className = 'model-fallback-notification';
                        fallbackNotification.textContent = data.error;

                        // Add notification to the page
                        document.querySelector('.container').insertBefore(
                            fallbackNotification,
                            document.querySelector('.input-container')
                        );

                        // Remove notification after 5 seconds
                        setTimeout(() => {
                            fallbackNotification.style.opacity = '0';
                            setTimeout(() => fallbackNotification.remove(), 500);
                        }, 5000);

                        // Don't close the event source, as we're falling back to default model
                    } else {
                        // For other errors, close the connection and show error
                        eventSource.close();
                        loadingIndicator.style.display = 'none';
                        responseContent.innerHTML = `<p class="error-message">Error: ${data.error || 'Unknown error'}</p>`;
                    }
                    break;
            }
        } catch (error) {
            console.error('Error parsing event:', error);
        }
    };

    eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        loadingIndicator.style.display = 'none';

        if (!responseText) {
            responseContent.innerHTML = `<p class="error-message">Error: Connection to server lost</p>`;
        }
    };
}

// Fetch regular response from API
async function fetchResponse(prompt, model) {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, model }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get response from API');
        }

        const data = await response.json();
        return {
            response: data.response || ''
        };
    } catch (error) {
        console.error('Error fetching response:', error);
        throw error;
    }
}

// Display response in the UI
function displayResponse(response) {
    // Process special formatting for math expressions
    let formattedResponse = response;

    // Clean up redundant markdown and formatting
    // First, normalize line endings
    formattedResponse = formattedResponse.replace(/\r\n/g, '\n');

    // Format boxed answers (only once)
    formattedResponse = formattedResponse.replace(/\\boxed\{([^}]+)\}/g, '<span class="boxed">$1</span>');

    // Format LaTeX-like math expressions
    formattedResponse = formattedResponse.replace(/\\text\{([^}]+)\}/g, '$1');
    formattedResponse = formattedResponse.replace(/\\times/g, '×');

    // Format calculation steps
    formattedResponse = formattedResponse.replace(/\[\s*\\text/g, '<div class="math-step">\\text');
    formattedResponse = formattedResponse.replace(/\\\]/g, '</div>');

    // Remove redundant markdown formatting
    // First pass: Convert markdown to HTML
    formattedResponse = formattedResponse
        // Handle numbered steps with bold (only once)
        .replace(/(\d+\.\s*)\*\*([^*]+)\*\*/g, '<strong>$1$2</strong>')
        // Handle other bold text (only once)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        // Handle italic text (only once)
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        // Handle code blocks (only once)
        .replace(/`([^`]+)`/g, '<code>$1</code>');

    // Second pass: Remove any remaining markdown that wasn't converted
    formattedResponse = formattedResponse
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1');

    // Add calculation synthesis if it's a math problem
    if (formattedResponse.includes('discount') ||
        formattedResponse.includes('calculate') ||
        formattedResponse.includes('math') ||
        formattedResponse.includes('$')) {

        // Extract calculation steps
        const steps = [];
        const stepRegex = /<strong>(\d+\.\s*[^<]+)<\/strong>/g;
        let match;

        while ((match = stepRegex.exec(formattedResponse)) !== null) {
            steps.push(match[1]);
        }

        // Extract final answer if available
        let finalAnswer = '';
        const boxedMatch = formattedResponse.match(/<span class="boxed">([^<]+)<\/span>/);
        if (boxedMatch) {
            finalAnswer = boxedMatch[1];
        }

        // Create synthesis
        if (steps.length > 0 || finalAnswer) {
            const synthesis = `<div class="calculation-synthesis">
                <div class="synthesis-title">Calculation Synthesis</div>
                <div class="synthesis-content">
                    ${steps.map(step => `• ${step}`).join('\n')}
                    ${finalAnswer ? `\n\nResult: ${finalAnswer}` : ''}
                </div>
            </div>`;

            // Insert synthesis before the first paragraph
            const firstParagraphIndex = formattedResponse.indexOf('<p>');
            if (firstParagraphIndex !== -1) {
                formattedResponse = formattedResponse.slice(0, firstParagraphIndex) +
                                   synthesis +
                                   formattedResponse.slice(firstParagraphIndex);
            } else {
                formattedResponse = synthesis + formattedResponse;
            }
        }
    }

    // Clean up any double HTML tags that might have been created
    formattedResponse = formattedResponse
        .replace(/<strong><strong>/g, '<strong>')
        .replace(/<\/strong><\/strong>/g, '</strong>')
        .replace(/<em><em>/g, '<em>')
        .replace(/<\/em><\/em>/g, '</em>');

    // Convert line breaks to <br> tags and wrap in paragraphs
    formattedResponse = formattedResponse
        .split('\n\n')
        .map(paragraph => {
            // Skip paragraphs that are already HTML elements
            if (paragraph.trim().startsWith('<') && !paragraph.trim().startsWith('<br>')) {
                return paragraph;
            }
            return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
        })
        .join('');

    responseContent.innerHTML = formattedResponse;
}

