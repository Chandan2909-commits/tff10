import { GENERAL_QA_DATASET, PROP_FIRM_QA_DATASET } from './dataset.js';

const CUSTOMER_CARE_NUMBER = "14545454";
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzuzQWPc85A9RSJ3mdtYj7NGym8rCOjunMGAMluVEf9k4hssAGrVxwfXG4d1RzYcLoE/exec";

// Combine datasets
const FULL_DATASET = [...GENERAL_QA_DATASET, ...PROP_FIRM_QA_DATASET];

// Format dataset for the AI context
const KNOWLEDGE_BASE_TEXT = FULL_DATASET.map(item => `Q: ${item.question}\nA: ${item.answer}`).join("\n\n");

let state = {
    turn_count: 0,
    last_intent: null,
    satisfaction_asked: false,
    dissatisfaction_count: 0,
    conversation_ended: false,
    message_count: 0,
    user_verified: false,
    pending_first_message: null,
    attached_files: [],
    user_name: null,
    user_email: null,
    user_phone: null,
    suggestions_shown: false
};

const chatMessages = document.querySelector('.chat-messages');
const homeTab = document.getElementById('home-tab');
const messagesTab = document.getElementById('messages-tab');
const chatInput = document.querySelector('.input-wrapper input[type="text"]');
const sendBtn = document.querySelector('.send-btn');
const statusText = document.querySelector('.status-text');

// Switch to Messages tab
window.switchToMessages = function () {
    homeTab.style.display = 'none';
    messagesTab.style.display = 'flex';
    messagesTab.style.flexDirection = 'column';
    messagesTab.style.gap = '0';
    messagesTab.style.padding = '0';
    document.getElementById('help-tab').style.display = 'none';
    document.getElementById('chat-input-area').style.display = 'flex';

    document.querySelectorAll('.chat-bottom-nav .nav-item').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-tab="messages"]').classList.add('active');

    if (messagesTab.children.length === 0) {
        // Add header
        const headerDiv = document.createElement('div');
        headerDiv.classList.add('messages-header');
        headerDiv.innerHTML = `
            <div class="messages-header-left">
                <div class="messages-header-avatar">
                    <img src="chatbot img.jpeg" alt="Neeraj Avatar">
                </div>
                <div class="messages-header-info">
                    <div class="messages-header-title">Neeraj</div>
                    <div class="messages-header-status">Online</div>
                </div>
            </div>
            <button class="messages-header-close" onclick="closeMessagesTab()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        `;
        messagesTab.appendChild(headerDiv);

        // Add content container
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('messages-content');
        contentDiv.id = 'messages-content';
        messagesTab.appendChild(contentDiv);

        showWelcomeMessage();
    }
};

window.closeMessagesTab = function () {
    homeTab.style.display = 'block';
    messagesTab.style.display = 'none';
    document.getElementById('chat-input-area').style.display = 'none';
    document.querySelectorAll('.chat-bottom-nav .nav-item').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-tab="home"]').classList.add('active');
};

// Switch to Help tab
window.switchToHelp = function () {
    homeTab.style.display = 'none';
    messagesTab.style.display = 'none';
    document.getElementById('help-tab').style.display = 'block';
    document.getElementById('chat-input-area').style.display = 'none';

    document.querySelectorAll('.chat-bottom-nav .nav-item').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-tab="help"]').classList.add('active');

    // Reset to main help view
    document.getElementById('help-main').style.display = 'block';
    document.getElementById('help-category').style.display = 'none';
    document.getElementById('help-article').style.display = 'none';
    document.getElementById('help-search-results').style.display = 'none';
    document.getElementById('help-search-input').value = '';
};

// Ask question from home
window.askQuestion = function (question) {
    switchToMessages();
    setTimeout(() => {
        chatInput.value = question;
        handleUserMessage();
    }, 300);
};

// Helper to add message with formatting
function addMessage(text, sender, isHtml = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'bot' ? 'bot-message' : 'user-message');

    if (sender === 'bot') {
        // Add Neeraj avatar for bot messages
        const avatarDiv = document.createElement('div');
        avatarDiv.classList.add('bot-avatar');
        avatarDiv.textContent = 'Neeraj';
        messageDiv.appendChild(avatarDiv);
    }

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');

    if (isHtml) {
        contentDiv.innerHTML = text;
    } else {
        // Format text for better display
        const formattedText = formatText(text);
        contentDiv.innerHTML = formattedText;
    }

    const timeDiv = document.createElement('div');
    timeDiv.classList.add('message-time');
    timeDiv.textContent = 'Just now';

    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);

    const messagesContent = document.getElementById('messages-content') || messagesTab;
    messagesContent.appendChild(messageDiv);

    // Scroll to bottom
    messagesContent.scrollTop = messagesContent.scrollHeight;
}

// Format text for better display
function formatText(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/(?<!\*)\*(?!\*)(.*?)\*(?!\*)/g, '<em>$1</em>') // Italic (not part of **)
        .replace(/`(.*?)`/g, '<code>$1</code>') // Inline code
        .replace(/^\* (.+)$/gm, '<li>$1</li>') // Convert * bullets to list items
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>') // Wrap list items in ul
        .replace(/<\/li>\s*<li>/g, '</li><li>') // Clean up list formatting
        .replace(/\n\n/g, '</p><p>') // Paragraphs
        .replace(/\n/g, '<br>') // Line breaks
        .replace(/^(.*)$/, '<p>$1</p>') // Wrap in paragraph
        .replace(/<p><ul>/g, '<ul>').replace(/<\/ul><\/p>/g, '</ul>') // Fix ul wrapping
        .replace(/<p><\/p>/g, '') // Remove empty paragraphs
        .replace(/^<p>/, '').replace(/<\/p>$/, '') // Remove outer paragraph tags
        .replace(/&#39;/g, "'") // Fix HTML entities
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&');
}

// LOCAL FALLBACK MATCHING (In case API fails)
function findBestMatchFallback(userInput) {
    if (!userInput) return null;

    const STOP_WORDS = new Set([
        "a", "an", "the", "is", "are", "was", "were", "to", "of", "in", "on", "at", "for",
        "by", "with", "about", "how", "what", "when", "where", "who", "why", "can", "could",
        "would", "should", "do", "does", "did", "i", "me", "my", "you", "your", "it", "its",
        "we", "our", "they", "their", "hello", "hi", "hey"
    ]);

    function getTokens(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 0);
    }

    function getMeaningfulTokens(tokens) {
        return tokens.filter(word => !STOP_WORDS.has(word));
    }

    const inputTokens = getTokens(userInput);
    const inputMeaningful = getMeaningfulTokens(inputTokens);

    let bestMatch = null;
    let highestScore = 0;

    for (const item of FULL_DATASET) {
        if (!item.question) continue;

        const questionTokens = getTokens(item.question);
        const questionMeaningful = getMeaningfulTokens(questionTokens);

        const useMeaningful = inputMeaningful.length > 0 && questionMeaningful.length > 0;
        const setA = useMeaningful ? inputMeaningful : inputTokens;
        const setB = useMeaningful ? questionMeaningful : questionTokens;

        let matchCount = 0;
        for (const word of setA) {
            if (setB.includes(word)) {
                matchCount++;
            }
        }

        let score = 0;
        const totalTokens = setA.length + setB.length;
        if (totalTokens > 0) {
            score = (2 * matchCount) / totalTokens;
        }

        const normalizedInput = inputTokens.join(' ');
        const normalizedQuestion = questionTokens.join(' ');

        if (normalizedInput === normalizedQuestion) {
            score = 1.1;
        } else if (normalizedQuestion.includes(normalizedInput) || normalizedInput.includes(normalizedQuestion)) {
            score += 0.2;
        }

        if (score > highestScore) {
            highestScore = score;
            bestMatch = item;
        }
    }

    if (highestScore > 0.3) {
        return bestMatch.answer;
    }
    return null;
}

// Call API endpoint
async function callGroqAPI(userMessage) {
    try {
        const GROQ_API_KEY = ""; // Key configured on deployment
        const systemPrompt = `You are Neeraj, an intelligent assistant for The Fusion Funded, a proprietary trading firm. Your role is to answer questions STRICTLY based on the knowledge base provided below.

IMPORTANT RULES:
1. ONLY use information from the knowledge base below to answer questions
2. If a question is about The Fusion Funded but not in the knowledge base, say: "I don't have that specific information. Please contact support for detailed assistance."
3. For questions unrelated to prop trading, say: "I can only help with The Fusion Funded related questions."
4. Keep responses concise (50-100 words) and helpful
5. Use bullet points for lists when appropriate
6. Match the tone and detail level from the knowledge base answers

KNOWLEDGE BASE:
${KNOWLEDGE_BASE_TEXT}

Answer the user's question based ONLY on the above knowledge base.`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.3,
                max_tokens: 200
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error("API Error:", error);

        // Use Fallback silently
        const fallbackResponse = findBestMatchFallback(userMessage);
        if (fallbackResponse) {
            return fallbackResponse;
        }

        return "I'm having trouble connecting to the server. Please try again.";
    }
}

// Handle User Message
async function handleUserMessage() {
    if (state.conversation_ended) return;

    const input = chatInput.value.trim();
    if (!input && state.attached_files.length === 0) return;

    // Check word limit
    const wordCount = input.split(/\s+/).length;
    if (wordCount > 50) {
        alert('Please limit your message to 50 words or less.');
        return;
    }

    // If user not verified, show verification form
    if (!state.user_verified) {
        state.pending_first_message = input;
        addMessage(input, 'user');
        chatInput.value = '';
        clearAttachments();
        showVerificationForm();
        return;
    }

    // Check message limit
    state.message_count++;
    if (state.message_count > 5) {
        addMessage(`I'm so sorry I am not able to solve your query. For immediate assistance, please contact our customer care team:<br><br>
            <a href="https://wa.me/${CUSTOMER_CARE_NUMBER}" target="_blank" style="display: flex; align-items: center; gap: 8px; color: #25D366; text-decoration: none; margin-bottom: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                WhatsApp
            </a>
            <a href="https://t.me/${CUSTOMER_CARE_NUMBER}" target="_blank" style="display: flex; align-items: center; gap: 8px; color: #0088cc; text-decoration: none; margin-bottom: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                Telegram
            </a>
            <a href="tel:${CUSTOMER_CARE_NUMBER}" style="display: flex; align-items: center; gap: 8px; color: #007AFF; text-decoration: none;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                ${CUSTOMER_CARE_NUMBER}
            </a><br>They'll be able to help you right away.`, 'bot', true);
        chatInput.disabled = true;
        sendBtn.disabled = true;
        state.conversation_ended = true;
        return;
    }

    // Add user message
    addMessage(input, 'user');
    chatInput.value = '';
    clearAttachments();

    // Check if user wants to talk to a live agent
    const liveAgentKeywords = [
        'live agent', 'real human', 'human agent', 'talk to human', 'speak to human',
        'real person', 'actual person', 'customer service', 'customer support',
        'speak to agent', 'talk to agent', 'connect me to agent', 'human support',
        'real agent', 'live person', 'live support', 'human help'
    ];
    
    const inputLower = input.toLowerCase();
    const wantsLiveAgent = liveAgentKeywords.some(keyword => inputLower.includes(keyword));
    
    if (wantsLiveAgent) {
        addMessage(`I'm so sorry I am not able to solve your query. For immediate assistance, please contact our customer care team:<br><br>
            <a href="https://wa.me/${CUSTOMER_CARE_NUMBER}" target="_blank" style="display: flex; align-items: center; gap: 8px; color: #25D366; text-decoration: none; margin-bottom: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                WhatsApp
            </a>
            <a href="https://t.me/${CUSTOMER_CARE_NUMBER}" target="_blank" style="display: flex; align-items: center; gap: 8px; color: #0088cc; text-decoration: none; margin-bottom: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                Telegram
            </a>
            <a href="tel:${CUSTOMER_CARE_NUMBER}" style="display: flex; align-items: center; gap: 8px; color: #007AFF; text-decoration: none;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                ${CUSTOMER_CARE_NUMBER}
            </a><br>They'll be able to help you right away.`, 'bot', true);
        return;
    }

    // Disable send button and show loading
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<div class="btn-loader"></div>';

    // Send to Google Sheets
    sendChatToSheets(input);

    state.turn_count++;

    // Add temporary loading message
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'bot-message', 'loading-msg');
    loadingDiv.innerHTML = `
        <div class="bot-avatar">Neeraj</div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    const messagesContent = document.getElementById('messages-content') || messagesTab;
    messagesContent.appendChild(loadingDiv);
    messagesContent.scrollTop = messagesContent.scrollHeight;

    // Call API with full context logic
    const responseText = await callGroqAPI(input);

    // Wait minimum 2 seconds before showing response
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Remove loading message
    loadingDiv.remove();

    addMessage(responseText, 'bot');

    // Re-enable send button
    sendBtn.disabled = false;
    sendBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 2L11 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    // Show default message after bot response
    setTimeout(() => {
        showDefaultMessage();
    }, 1500);

    // Satisfaction Check Logic
    if (state.turn_count >= 3 && !state.satisfaction_asked) {
        setTimeout(() => askSatisfaction(), 1000);
    }
}

function askSatisfaction() {
    const satisfactionDiv = document.createElement('div');
    satisfactionDiv.classList.add('message', 'bot-message');
    satisfactionDiv.innerHTML = `
        <div class="message-content">
            Does this answer clear things up for you?
            <div class="satisfaction-buttons" style="margin-top: 10px; display: flex; gap: 10px;">
                <button onclick="handleSatisfaction('yes')" class="sat-btn">Yes</button>
                <button onclick="handleSatisfaction('no')" class="sat-btn">No</button>
            </div>
        </div>
        <div class="message-time">Just now</div>
    `;
    const messagesContent = document.getElementById('messages-content') || messagesTab;
    messagesContent.appendChild(satisfactionDiv);
    messagesContent.scrollTop = messagesContent.scrollHeight;
    state.satisfaction_asked = true;
}

// Expose to window for inline onclicks
window.handleSatisfaction = function (answer) {
    if (state.conversation_ended) return;

    if (answer === 'yes') {
        setTimeout(() => {
            addMessage("Great! If you have more questions regarding any topic, I’m here to help.", 'bot');
            state.satisfaction_asked = false;
            state.dissatisfaction_count = 0;
        }, 500);
    } else {
        state.dissatisfaction_count++;
        if (state.dissatisfaction_count === 1) {
            setTimeout(() => {
                addMessage("I’m sorry about that — let’s sort it out. Can you tell me what part was unclear or what you’d like explained differently?", 'bot');
                state.satisfaction_asked = false;
            }, 500);
        } else if (state.dissatisfaction_count >= 2) {
            setTimeout(() => {
                addMessage(`I'm so sorry I am not able to solve your query. For immediate assistance, please contact our customer care team:<br><br>
            <a href="https://wa.me/${CUSTOMER_CARE_NUMBER}" target="_blank" style="display: flex; align-items: center; gap: 8px; color: #25D366; text-decoration: none; margin-bottom: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                WhatsApp
            </a>
            <a href="https://t.me/${CUSTOMER_CARE_NUMBER}" target="_blank" style="display: flex; align-items: center; gap: 8px; color: #0088cc; text-decoration: none; margin-bottom: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                Telegram
            </a>
            <a href="tel:${CUSTOMER_CARE_NUMBER}" style="display: flex; align-items: center; gap: 8px; color: #007AFF; text-decoration: none;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                ${CUSTOMER_CARE_NUMBER}
            </a><br>They'll be able to help you right away.`, 'bot', true);
                state.conversation_ended = true;
                statusText.textContent = "Offline";
                statusText.style.color = "gray";
                document.querySelector('.status-dot').style.backgroundColor = "gray";
                chatInput.disabled = true;
                sendBtn.disabled = true;
            }, 500);
        }
    }

    // Remove buttons to prevent multiple clicks
    const btns = document.querySelectorAll('.sat-btn');
    btns.forEach(btn => {
        if (!btn.getAttribute('onclick').includes('startNewChat')) {
            btn.remove();
        }
    });
};

const SUGGESTED_QUESTIONS = [
    "What is a prop firm?",
    "How to take a payout",
    "Drawdown rules",
    "Profit split"
];

function showDefaultMessage() {
    // Removed - suggestions only shown at welcome
}

function showWelcomeMessage() {
    const welcomeMsg = `Hello! I'm your Intelligent Assistant. I can explain rules, challenges, risk limits, payouts, and operational policies. How can I help you today?`;

    // Create suggestion chips HTML
    const suggestionsHtml = `
        <div class="suggestion-container">
            ${SUGGESTED_QUESTIONS.map(q =>
        `<button onclick="handleSuggestion('${q}')" class="suggestion-chip">${q}</button>`
    ).join('')}
        </div>
    `;

    addMessage(welcomeMsg + suggestionsHtml, 'bot', true);
    state.suggestions_shown = true;
}

window.handleSuggestion = function (text) {
    if (state.conversation_ended) return;
    chatInput.value = text;
    handleUserMessage();
};

// Show verification form
function showVerificationForm() {
    const formDiv = document.createElement('div');
    formDiv.classList.add('message', 'bot-message', 'verification-form-container');
    formDiv.innerHTML = `
        <div class="message-content">
            <p style="margin-bottom: 12px;">Before we continue, please provide your contact details:</p>
            <div class="verification-form">
                <input type="text" id="user-name" placeholder="Full name" required />
                <input type="email" id="user-email" placeholder="Email address" required />
                <div class="phone-input-wrapper">
                    <select id="country-code" class="country-code-select">
                        <option value="+93">🇦🇫 Afghanistan (+93)</option>
                        <option value="+355">🇦🇱 Albania (+355)</option>
                        <option value="+213">🇩🇿 Algeria (+213)</option>
                        <option value="+1">🇺🇸 United States (+1)</option>
                        <option value="+54">🇦🇷 Argentina (+54)</option>
                        <option value="+61">🇦🇺 Australia (+61)</option>
                        <option value="+43">🇦🇹 Austria (+43)</option>
                        <option value="+880">🇧🇩 Bangladesh (+880)</option>
                        <option value="+32">🇧🇪 Belgium (+32)</option>
                        <option value="+55">🇧🇷 Brazil (+55)</option>
                        <option value="+1">🇨🇦 Canada (+1)</option>
                        <option value="+86">🇨🇳 China (+86)</option>
                        <option value="+57">🇨🇴 Colombia (+57)</option>
                        <option value="+45">🇩🇰 Denmark (+45)</option>
                        <option value="+20">🇪🇬 Egypt (+20)</option>
                        <option value="+358">🇫🇮 Finland (+358)</option>
                        <option value="+33">🇫🇷 France (+33)</option>
                        <option value="+49">🇩🇪 Germany (+49)</option>
                        <option value="+30">🇬🇷 Greece (+30)</option>
                        <option value="+852">🇭🇰 Hong Kong (+852)</option>
                        <option value="+36">🇭🇺 Hungary (+36)</option>
                        <option value="+91" selected>🇮🇳 India (+91)</option>
                        <option value="+62">🇮🇩 Indonesia (+62)</option>
                        <option value="+353">🇮🇪 Ireland (+353)</option>
                        <option value="+972">🇮🇱 Israel (+972)</option>
                        <option value="+39">🇮🇹 Italy (+39)</option>
                        <option value="+81">🇯🇵 Japan (+81)</option>
                        <option value="+254">🇰🇪 Kenya (+254)</option>
                        <option value="+82">🇰🇷 South Korea (+82)</option>
                        <option value="+60">🇲🇾 Malaysia (+60)</option>
                        <option value="+52">🇲🇽 Mexico (+52)</option>
                        <option value="+31">🇳🇱 Netherlands (+31)</option>
                        <option value="+64">🇳🇿 New Zealand (+64)</option>
                        <option value="+234">🇳🇬 Nigeria (+234)</option>
                        <option value="+47">🇳🇴 Norway (+47)</option>
                        <option value="+92">🇵🇰 Pakistan (+92)</option>
                        <option value="+63">🇵🇭 Philippines (+63)</option>
                        <option value="+48">🇵🇱 Poland (+48)</option>
                        <option value="+351">🇵🇹 Portugal (+351)</option>
                        <option value="+974">🇶🇦 Qatar (+974)</option>
                        <option value="+7">🇷🇺 Russia (+7)</option>
                        <option value="+966">🇸🇦 Saudi Arabia (+966)</option>
                        <option value="+65">🇸🇬 Singapore (+65)</option>
                        <option value="+27">🇿🇦 South Africa (+27)</option>
                        <option value="+34">🇪🇸 Spain (+34)</option>
                        <option value="+94">🇱🇰 Sri Lanka (+94)</option>
                        <option value="+46">🇸🇪 Sweden (+46)</option>
                        <option value="+41">🇨🇭 Switzerland (+41)</option>
                        <option value="+886">🇹🇼 Taiwan (+886)</option>
                        <option value="+66">🇹🇭 Thailand (+66)</option>
                        <option value="+90">🇹🇷 Turkey (+90)</option>
                        <option value="+971">🇦🇪 UAE (+971)</option>
                        <option value="+44">🇬🇧 United Kingdom (+44)</option>
                        <option value="+84">🇻🇳 Vietnam (+84)</option>
                    </select>
                    <input type="tel" id="user-phone" placeholder="Phone number" required />
                </div>
                <button onclick="submitVerification()" class="verify-btn">Submit</button>
                <div id="verification-error" class="verification-error"></div>
            </div>
        </div>
        <div class="message-time">Just now</div>
    `;
    const messagesContent = document.getElementById('messages-content') || messagesTab;
    messagesContent.appendChild(formDiv);
    messagesContent.scrollTop = messagesContent.scrollHeight;
    chatInput.disabled = true;
    sendBtn.disabled = true;
}

// Submit verification
window.submitVerification = async function () {
    const name = document.getElementById('user-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const countryCode = document.getElementById('country-code').value;
    const phone = document.getElementById('user-phone').value.trim();
    const errorDiv = document.getElementById('verification-error');
    const submitBtn = document.querySelector('.verify-btn');

    // Validate name
    if (!name || name.length < 2) {
        errorDiv.textContent = 'Please enter your full name';
        return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorDiv.textContent = 'Please enter a valid email address';
        return;
    }

    // Validate phone (digits only, 7-15 digits)
    const phoneRegex = /^\d{7,15}$/;
    if (!phoneRegex.test(phone)) {
        errorDiv.textContent = 'Please enter a valid phone number (7-15 digits)';
        return;
    }

    // Show loading on submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="btn-loader"></div>';

    const fullPhone = "'" + countryCode + ' ' + phone;

    // Send to Google Sheets
    try {
        const payload = {
            name: name,
            email: email,
            phone: fullPhone,
            message: state.pending_first_message || ''
        };
        console.log('Sending to Google Sheets:', payload);
        await fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error('Failed to send to Google Sheets:', error);
    }

    // Mark as verified and store user info
    state.user_verified = true;
    state.user_name = name;
    state.user_email = email;
    state.user_phone = fullPhone;
    errorDiv.textContent = '';

    // Update button to verified state
    submitBtn.innerHTML = 'Verified ✓';

    // Disable form
    document.getElementById('user-name').disabled = true;
    document.getElementById('user-email').disabled = true;
    document.getElementById('country-code').disabled = true;
    document.getElementById('user-phone').disabled = true;

    // Re-enable chat input
    chatInput.disabled = false;
    sendBtn.disabled = false;

    // Process the pending message
    if (state.pending_first_message) {
        processPendingMessage();
    }
};

// Process pending message after verification
async function processPendingMessage() {
    const input = state.pending_first_message;
    state.pending_first_message = null;

    // Check message limit
    state.message_count++;
    if (state.message_count > 5) {
        addMessage(`I'm so sorry I am not able to solve your query. For immediate assistance, please contact our customer care team:<br><br>
            <a href="https://wa.me/${CUSTOMER_CARE_NUMBER}" target="_blank" style="display: flex; align-items: center; gap: 8px; color: #25D366; text-decoration: none; margin-bottom: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                WhatsApp
            </a>
            <a href="https://t.me/${CUSTOMER_CARE_NUMBER}" target="_blank" style="display: flex; align-items: center; gap: 8px; color: #0088cc; text-decoration: none; margin-bottom: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                Telegram
            </a>
            <a href="tel:${CUSTOMER_CARE_NUMBER}" style="display: flex; align-items: center; gap: 8px; color: #007AFF; text-decoration: none;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                ${CUSTOMER_CARE_NUMBER}
            </a><br>They'll be able to help you right away.`, 'bot', true);
        chatInput.disabled = true;
        sendBtn.disabled = true;
        state.conversation_ended = true;
        return;
    }

    state.turn_count++;

    // Disable send button and show loading
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<div class="btn-loader"></div>';

    // Add temporary loading message
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'bot-message', 'loading-msg');
    loadingDiv.innerHTML = `
        <div class="bot-avatar">Neeraj</div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    const messagesContent = document.getElementById('messages-content') || messagesTab;
    messagesContent.appendChild(loadingDiv);
    messagesContent.scrollTop = messagesContent.scrollHeight;

    // Call API with full context logic
    const responseText = await callGroqAPI(input);

    // Wait minimum 2 seconds before showing response
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Remove loading message
    loadingDiv.remove();

    addMessage(responseText, 'bot');

    // Re-enable send button
    sendBtn.disabled = false;
    sendBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 2L11 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    // Show default message after bot response
    setTimeout(() => {
        showDefaultMessage();
    }, 1500);

    // Satisfaction Check Logic
    if (state.turn_count >= 3 && !state.satisfaction_asked) {
        setTimeout(() => askSatisfaction(), 1000);
    }
}

window.startNewChat = function () {
    // Reset State
    state = {
        turn_count: 0,
        last_intent: null,
        satisfaction_asked: false,
        dissatisfaction_count: 0,
        conversation_ended: false,
        message_count: 0,
        user_verified: false,
        pending_first_message: null,
        attached_files: [],
        user_name: null,
        user_email: null,
        user_phone: null,
        suggestions_shown: false
    };

    // Reset UI
    messagesTab.innerHTML = '';

    // Add Welcome Message with Suggestions
    showWelcomeMessage();

    // Re-enable Input
    chatInput.disabled = false;
    sendBtn.disabled = false;
    chatInput.value = '';
    chatInput.focus();

    // Reset Status
    statusText.textContent = "Online";
    statusText.style.color = "#666666";
    document.querySelector('.status-dot').style.backgroundColor = "#34d399";
};

// File attachment handlers
window.handleFileUpload = function (event) {
    const files = Array.from(event.target.files);
    files.forEach(file => {
        state.attached_files.push({ name: file.name, type: 'file' });
    });
    updateAttachmentPreview();
    event.target.value = '';
};

window.handleVoiceRecord = function () {
    state.attached_files.push({ name: 'Voice message', type: 'voice' });
    updateAttachmentPreview();
};

function updateAttachmentPreview() {
    const container = document.getElementById('attachment-preview');
    if (state.attached_files.length === 0) {
        container.style.display = 'none';
        return;
    }
    container.style.display = 'flex';
    container.innerHTML = state.attached_files.map((file, idx) => `
        <div class="attachment-chip">
            <span>${file.type === 'voice' ? '🎤' : '📎'} ${file.name}</span>
            <button onclick="removeAttachment(${idx})" class="remove-attachment">×</button>
        </div>
    `).join('');
}

window.removeAttachment = function (index) {
    state.attached_files.splice(index, 1);
    updateAttachmentPreview();
};

function clearAttachments() {
    state.attached_files = [];
    updateAttachmentPreview();
}

// Send chat message to Google Sheets
async function sendChatToSheets(message) {
    if (!state.user_verified || !state.user_email) return;

    try {
        await fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: state.user_name || '',
                email: state.user_email,
                phone: state.user_phone || '',
                message: message
            })
        });
    } catch (error) {
        console.error('Failed to send chat to Google Sheets:', error);
    }
}

// Initialize chat on load
// Don't auto-start, show home tab by default

// Event Listeners
sendBtn.addEventListener('click', handleUserMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserMessage();
});

// Widget Toggle Logic
const chatContainer = document.querySelector('.chat-container');
const chatLauncher = document.getElementById('chat-launcher');
const closeBtn = document.getElementById('header-close-btn');
const launcherIcon = document.querySelector('.launcher-icon');
const closeIcon = document.querySelector('.close-icon');

function toggleChat() {
    const isActive = chatContainer.classList.contains('active');

    if (isActive) {
        chatContainer.classList.remove('active');
        launcherIcon.style.display = 'block';
        closeIcon.style.display = 'none';
    } else {
        chatContainer.classList.add('active');
        launcherIcon.style.display = 'none';
        closeIcon.style.display = 'block';
        // Focus input when opened
        setTimeout(() => chatInput.focus(), 300);
    }
}

chatLauncher.addEventListener('click', toggleChat);
closeBtn.addEventListener('click', () => {
    chatContainer.classList.remove('active');
    launcherIcon.style.display = 'block';
    closeIcon.style.display = 'none';
});

// Bottom Navigation Handler
document.querySelectorAll('.chat-bottom-nav .nav-item').forEach(item => {
    item.addEventListener('click', function () {
        document.querySelectorAll('.chat-bottom-nav .nav-item').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        const tab = this.getAttribute('data-tab');
        // Tab functionality can be extended here
        console.log('Switched to:', tab);

        if (tab === 'home') {
            homeTab.style.display = 'block';
            messagesTab.style.display = 'none';
            document.getElementById('help-tab').style.display = 'none';
            document.getElementById('chat-input-area').style.display = 'none';
        } else if (tab === 'messages') {
            switchToMessages();
        } else if (tab === 'help') {
            switchToHelp();
        }
    });
});

// FAQ Data Structure - Comprehensive Sharkfunded Knowledge Base
const FAQ_DATA = {
    evaluation: {
        title: "All Collections ",
        questions: [
            {
                q: "What is The Fusion Funded?",
                a: "<p>The Fusion Funded is a proprietary trading firm that provides traders with access to funded capital through a structured evaluation process. Our model is specifically designed for traders who use high-frequency trading systems (HFT), automation, and advanced execution strategies to achieve performance efficiently.</p><p>Unlike traditional prop firms, The Fusion Funded allows traders to use HFT-based strategies during the challenge phase, enabling faster completion of evaluation objectives. We operate on a single evaluation model: the HFT 2.0 Challenge — designed to assess a trader's ability to generate profits while maintaining strict risk management.</p><p>Traders may also choose to work with our trusted partners who specialize in high-frequency trading systems. All accounts that meet the evaluation criteria are reviewed and transitioned into a funded trading environment where structured risk rules apply.</p>"
            },
            {
                q: "What makes The Fusion Funded different?",
                a: "<p>The Fusion Funded operates on a performance-driven and execution-flexible model built specifically for modern traders. Key differences include: HFT-enabled challenge phase — traders can use high-frequency trading systems, automation, and fast execution strategies to complete the challenge. Single streamlined evaluation (HFT 2.0) — no complex multi-phase challenges, just one clear path to funding. Improved risk structure with 10% maximum drawdown and 7% daily drawdown. Flexible profit split of 60% → 70% → 80% → 90%. Faster progression designed to allow traders to complete evaluations efficiently using their preferred strategies. Once funded, traders operate under a structured and controlled trading environment to ensure long-term sustainability and capital protection.</p>"
            },
            {
                q: "How do I get started with The Fusion Funded?",
                a: "<p>Getting started with The Fusion Funded is simple! Step 1 — Choose Your Account: Select your preferred account size and purchase the HFT 2.0 Challenge. Step 2 — Start Trading: Begin trading on your challenge account. You may trade manually or use HFT systems and automated strategies to achieve the profit target. Traders may also choose to work with our trusted partners who can assist using high-frequency trading systems. Step 3 — Achieve the Profit Target: Reach the required profit target while following all trading rules. Step 4 — Account Review: Once the target is achieved, your account is reviewed to ensure compliance with all rules. Step 5 — Get Funded: After successful review, you will receive your funded account and can begin trading under the funded model.</p>"
            },
            {
                q: "Who can join The Fusion Funded?",
                a: "<p>The Fusion Funded is designed for retail traders worldwide who want to demonstrate their trading skills, improve performance, and earn profits through our funded account program. We welcome individuals who are passionate about trading, regardless of prior experience.</p><p>The Fusion Funded is open to traders from diverse backgrounds and experience levels. Both beginners and experienced traders are welcome to participate. All participants must be at least 18 years of age.</p><p><strong>Restricted Jurisdictions & Compliance:</strong></p><p>To comply with international regulations, The Fusion Funded does not provide services to individuals who are located in or are residents of the following countries or regions:</p><ul><li>Democratic People’s Republic of Korea (North Korea)</li><li>Iran</li><li>South Sudan</li><li>Sudan</li><li>Yemen</li></ul><p>Additionally, we do not provide services to individuals or entities listed on international sanctions lists or global anti-terrorism compliance lists.</p><p><strong>Additional Restrictions:</strong></p><ul><li>Individuals listed on international sanctions lists</li><li>Persons with criminal histories involving financial crimes or terrorism</li><li>Individuals previously banned due to contract violations or policy breaches</li></ul>"
            },
            {
                q: "The Fusion Funded — HFT 2.0 Challenge Model",
                a: "<p>The Fusion Funded operates on a single evaluation system known as the HFT 2.0 Challenge. This model is designed for traders who want to use high-frequency trading systems (HFT), automation, and advanced execution strategies to complete their evaluation efficiently.</p><p><strong>During the challenge phase:</strong></p><ul><li>HFT strategies are allowed</li><li>Tick scalping is allowed</li><li>Arbitrage and latency-based strategies are allowed</li></ul><p>Traders may also choose to work with our trusted partners who specialize in high-frequency trading systems and can assist in completing the challenge efficiently.</p><p><strong>Challenge Objectives:</strong></p><p>To successfully complete the HFT 2.0 Challenge, traders must: Achieve the required profit target (10% of initial account size), Follow all trading rules, Maintain proper risk management.</p><p><strong>Evaluation Process:</strong></p><p>Once the profit target is achieved, the account is placed under review. Trading behavior and rule compliance are verified. Upon approval, the trader is moved to the funded stage.</p>"
            },
            {
                q: "How many trading days are required to complete the evaluation?",
                a: "<p>The Fusion Funded requires a minimum of 12 trading days to complete the HFT 2.0 Challenge. An optional add-on may reduce this requirement to 7 trading days.</p><p>A trading day counts only if you place a trade and achieve at least 0.1x (one-tenth) of the highest profit on a single trade or trading day used during the payout cycle. Trades below this threshold will not be counted as valid trading days.</p>"
            },
            {
                q: "What is the minimum trading day rule?",
                a: "<p>A trading day will only count when the trader places a trade and achieves at least 0.1x (one-tenth) of the highest profit on a single trade or day used during the payout cycle.</p><p><strong>Example:</strong></p><ul><li>If the highest profit is $1,000, the minimum profit required to count a day is $100.</li></ul><p>Trades below this threshold are not counted as valid trading days.</p>"
            }
        ]
    },
    drawdown: {
        title: "Drawdown & Risk Management",
        questions: [
            {
                q: "Maximum Drawdown Rule",
                a: "<p>The Fusion Funded uses a drawdown model with both maximum and daily limits.</p><ul><li><strong>Maximum Drawdown:</strong> 10% of initial account size</li><li><strong>Daily Drawdown:</strong> 7% of initial account size</li></ul><p>Your balance or equity must never fall below the defined limits.</p><p><strong>Example:</strong></p><ul><li>Account Size: $100,000</li><li>Maximum Drawdown: $10,000</li><li>Daily Drawdown: $7,000</li><li>Minimum Equity Allowed: $90,000</li></ul>"
            },
            {
                q: "Single-Trade Risk Rule",
                a: "<p>A trader can risk a maximum of 20% of the total drawdown allowance in a single trade, and a mandatory Stop Loss (SL) on positions is required to track and keep the maximum allowed risk under 20%.</p><p><strong>Example:</strong></p><ul><li>Account Size: $100,000</li><li>Total Drawdown Allowance: $10,000</li><li>Maximum Risk Per Trade: $2,000</li></ul><p>Exceeding this limit at any point during trade execution or exposure calculation will be treated as a violation, regardless of trade outcome. This may be a warning for the first time but is a hard breach afterwards.</p>"
            },
            {
                q: "Account Violation (Hard Breach)",
                a: "<p>A hard breach represents a serious violation and results in immediate account termination.</p>"
            }
        ]
    },
    trading: {
        title: "Weekend Trading",
        questions: [
            {
                q: "Is Weekend Holding Allowed?",
                a: "<p><strong>Yes — Weekend Holding Is Allowed (With Prior Approval)</strong></p><p>Traders are permitted to hold positions over the weekend in both challenge and funded phases, but prior approval is required. To hold trades over the weekend, traders must inform support before the market closes on Friday. Approval requests can be made through any support method: WhatsApp, Instagram, Email, or the Contact Us panel. The request should clearly mention that positions will remain open. Failure to notify support before the Friday market close will result in a hard breach and account termination.</p><p><strong>Important Things to Keep in Mind:</strong></p><ul><li>Markets may open with price gaps after the weekend</li><li>Slippage or increased volatility can occur at market open</li><li>All standard risk rules including drawdown limits still apply</li></ul><p>We strongly recommend managing risk carefully when holding positions over the weekend.</p>"
            },
            {
                q: "Layering",
                a: "<p>Opening more than three positions on the same instrument in the same direction simultaneously is not allowed.</p><p>Adding positions to a losing trade, grid trading, or recovery-based entries may be treated as a violation.</p><ul><li>Soft breach during evaluation.</li><li>Hard breach during funded stage.</li></ul>"
            },
            {
                q: "Toxic Trading Behavior (Soft Breach)",
                a: "<p>Examples include:</p><ul><li>Ignoring risk management</li><li>Reckless trading behavior</li><li>Trading without a clear strategy</li><li>Emotion-driven trading</li></ul><p>Repeated violations may lead to restrictions or termination.</p>"
            },
            {
                q: "Excessive Risk-Taking / Over-Leveraging",
                a: "<p>Examples:</p><ul><li>Using disproportionately large position sizes</li><li>Using maximum lot size repeatedly</li><li>Taking trades that can damage the account quickly</li><li>Relying heavily on leverage</li></ul>"
            },
            {
                q: "What is the minimum trade holding time on funded accounts?",
                a: "<p>On funded accounts, each trade must be held for a minimum of 2 minutes.</p><p>Up to 1–2 trades per payout cycle may be ignored. If this limit is exceeded, it will be treated as a soft breach, the payout will be rejected, and the account may be reset to the initial balance.</p>"
            },
            {
                q: "Martingale Trading Policy",
                a: "<p>Martingale trading is strictly prohibited. Martingale includes increasing position size after a loss in an attempt to recover previous losses. The sum of all open positions will be treated as a single combined position. If a trader increases total exposure to more than 1.6X after a losing trade, it will be considered a martingale strategy.</p><p>Examples:</p><ul><li>Increasing lot size more than 1.6X after a loss</li><li>Re-entering trades with higher risk to recover drawdown</li><li>Adding positions that increase total exposure after a loss</li></ul><p><strong>Consequences:</strong></p><ul><li>Challenge phase: May be treated as a soft breach</li><li>Funded phase: May be treated as a hard breach</li></ul>"
            },
            {
                q: "Gambling Behavior",
                a: "<p>Examples:</p><ul><li>Random entries without analysis</li><li>Revenge trading</li><li>Emotional trading</li><li>Overtrading to recover losses</li></ul>"
            },
            {
                q: "Overtrading",
                a: "<p>Examples:</p><ul><li>Too many trades in a short time</li><li>Constant entries without confirmation</li><li>Emotion-driven execution</li></ul>"
            },
            {
                q: "Tick Scalping",
                a: "<p>Tick scalping refers to extremely fast trades capturing micro-movements.</p><p>Examples:</p><ul><li>Opening and closing trades within 120 seconds</li><li>High-frequency micro-scalping</li></ul><p>Up to 20% of total trades may be ignored. Beyond that, trades may be reviewed.</p>"
            },
            {
                q: "Arbitrage Trading (Restricted)",
                a: "<p>Opening trades to exploit price differences rather than market direction.</p><p>Example:</p><ul><li>Buy EURUSD</li><li>Sell GBPUSD to neutralize exposure.</li></ul><p>This may be treated as a violation.</p>"
            },
            {
                q: "Hedging",
                a: "<p>Improper hedging includes:</p><ul><li>Opposite trades on same instrument</li><li>Locking positions to remove exposure</li></ul>"
            },
            {
                q: "Reverse Trading",
                a: "<p>Examples:</p><ul><li>Intentionally losing trades</li><li>Offset trades across accounts</li><li>Manipulating exposure</li></ul><p>Trades placed within 15 minutes to neutralize exposure may be flagged.</p>"
            },
            {
                q: "One-Sided Bias Trading",
                a: "<p>Repeated trading in only one direction without justification may trigger review.</p>"
            },
            {
                q: "News Trading",
                a: "<p>News trading is fully allowed during both the challenge phases and the funded stage. Traders may open, close, and manage positions during:</p><ul><li>High-impact news releases</li><li>Economic announcements</li><li>Central bank speeches</li><li>Periods of increased market volatility</li></ul><p>There are no timing restrictions around news events. However, traders remain responsible for managing their own risk during volatile market conditions. Slippage, spreads, and rapid price movements may occur during news releases. All standard account rules, including the maximum drawdown rule, still apply.</p>"
            }
        ]
    },
    payouts: {
        title: "Withdrawals & Payouts",
        questions: [
            {
                q: "What Is the Minimum Amount Required for a Withdrawal?",
                a: "<p>To ensure efficient processing and reduce transaction costs, The Fusion Funded applies a minimum withdrawal requirement.</p><p><strong>Minimum Withdrawal Amount:</strong></p><ul><li>Minimum Withdrawal: 1% of the initial account size</li><li>Withdrawal requests below this amount cannot be processed.</li><li>Profits and eligible balances may be combined to meet the minimum requirement.</li><li>Giveaway accounts have a withdrawal limit of 2% only.</li></ul><p><strong>Why Is There a Minimum Withdrawal Requirement?</strong></p><p>The minimum withdrawal requirement exists to:</p><ul><li>Reduce administrative and processing overhead</li><li>Minimize transaction and network fees</li><li>Ensure a smoother payout experience for all traders</li></ul><p>Larger, less frequent withdrawals help keep payout operations efficient and reliable.</p>"
            },
            {
                q: "What are the Withdrawal Methods?",
                a: "<p>Available payout methods may include:</p><ul><li>Cryptocurrency (USDT and other supported crypto assets)</li><li>UPI transfers</li><li>Bank transfers</li><li>E-wallet payments (where available)</li></ul><p>Payment options may vary depending on location, availability, and payout method selected by the trader.</p>"
            },
            {
                q: "Requirements Before Withdrawing?",
                a: "<p>Before submitting a withdrawal request, make sure the following conditions are met:</p><ul><li>Your profit meets the minimum withdrawal requirement of 1% of the initial account size</li><li>You have completed at least 5 trading days on the funded account</li><li>KYC verification is completed and approved</li><li>All trading rules and profit-split conditions are met</li><li>No active violations or restrictions exist on your account</li><li>The account balance is above the starting balance</li></ul><p><strong>Important Withdrawal Rule:</strong></p><p>Once a withdrawal request is submitted, no trading activity is allowed on the account. Placing any trade after requesting a payout will be treated as a hard breach, and the account may be terminated.</p>"
            },
            {
                q: "How Long Does It Take to Receive a Withdrawal?",
                a: "<p>The Fusion Funded processes withdrawal requests on a weekly payout cycle while ensuring all compliance and security checks are completed.</p><p><strong>Withdrawal Processing Time:</strong></p><p>Payout Processing Day: Wednesday. All approved withdrawal requests are processed on Wednesday each week. Once processed, the time required for funds to arrive depends on the selected payout method (crypto, UPI, bank transfer, or e-wallet). Most payouts are completed within 24–48 hours after Wednesday processing.</p><p><strong>Possible Delays:</strong></p><p>In some cases, withdrawals may take longer due to: Weekends, Public holidays, Banking hours or payment provider schedules, Additional compliance or security checks.</p><p><strong>When Does the Processing Time Start?</strong></p><p>Withdrawal processing begins once: A withdrawal request is submitted, KYC verification is fully approved, The trader has completed at least 5 trading days on the funded account, The account meets the minimum withdrawal requirement (1% of initial balance), The account passes all risk and compliance checks, No trades are placed after the withdrawal request.</p>"
            }
        ]
    },
    compliance: {
        title: "KYC & Verification",
        questions: [
            {
                q: "Why Is Completing KYC Necessary for My Account?",
                a: "<p>Completing the Know Your Customer (KYC) process is a mandatory step to maintain a secure, fair, and compliant trading environment at The Fusion Funded.</p><p><strong>1. Legal & Regulatory Compliance:</strong> To comply with international regulations designed to prevent fraud, money laundering, identity misuse, and financial crime.</p><p><strong>2. Account Security & Protection:</strong> Adds an additional layer of security by linking trading accounts to verified personal information.</p><p><strong>3. Fair Trading Environment:</strong> Ensures that one individual does not operate multiple accounts and prevents duplicate or fraudulent accounts.</p><p><strong>4. Payout Eligibility:</strong> KYC verification must be completed before any payout request can be processed.</p>"
            },
            {
                q: "What Documents Are Required for KYC Verification?",
                a: "<p>To complete KYC verification, traders must submit valid documents confirming their identity and residential address.</p><p><strong>Personal Identification (Required):</strong> You must submit one valid government-issued photo ID.</p><ul><li>Passport (preferred)</li><li>Driver’s License</li><li>National ID Card</li></ul><p><strong>Important Requirements:</strong></p><ul><li>The document must be valid and not expired</li><li>The photo and personal details must be clear and readable</li><li>The name on the ID must match the name on your The Fusion Funded account</li></ul>"
            },
            {
                q: "How Long Does KYC Verification Take?",
                a: "<p><strong>Instant Verification:</strong> In some cases, KYC may be approved instantly when documents are clear, valid, and meet all requirements.</p><p><strong>Standard Verification:</strong> Most KYC checks are completed within 1–2 business days after document submission.</p><p><strong>What Can Affect Verification Time?</strong></p><ul><li>Documents are blurry or cropped</li><li>Information does not match account details</li><li>Documents are expired or incomplete</li><li>Additional verification checks are required</li></ul><p><strong>If Verification Takes Longer Than Expected:</strong> Check your email for follow-up requests, confirm all required documents were submitted, or contact support for assistance.</p>"
            },
            {
                q: "What Happens If My KYC Application Is Rejected?",
                a: "<p>If your KYC application is rejected, it does not mean you are permanently disqualified. Rejections usually occur due to missing, unclear, or mismatched information and can typically be resolved quickly.</p><p><strong>Common Reasons for KYC Rejection:</strong> Blurry/low quality documents, expired documents, mismatched name/address, missing/incomplete documents, suspicious activity.</p><p><strong>What Happens After a Rejection?</strong></p><ul><li><strong>Rejection Notification:</strong> You will receive an email explaining the reason.</li><li><strong>Resubmission Opportunity:</strong> You will be allowed to resubmit corrected documents.</li></ul><p><strong>How Long Does Re-Verification Take?</strong> Typically 1–2 business days.</p><p><strong>How to Avoid KYC Rejection:</strong> Upload high-quality images, ensure documents are valid, double-check that names and addresses match exactly, submit complete documents.</p>"
            }
        ]
    },
    operations: {
        title: "Account Security & Access Rules",
        questions: [
            {
                q: "What is the IP Address Policy?",
                a: "<p>There is No IP address location restrictions for traders. Traders may access their accounts from different locations, devices, or networks without violating account rules.</p><p><strong>Account Access & Security:</strong></p><p>While there are no IP region restrictions, traders remain responsible for maintaining account security. The following practices are still prohibited:</p><ul><li>Account sharing</li><li>Unauthorized third-party access</li><li>Selling or transferring account access</li><li>Using compromised or stolen identities</li></ul><p>If suspicious account activity is detected, the Risk Management Team may request identity verification to protect the account.</p><p><strong>Important Notes:</strong></p><ul><li>Traders may travel and trade freely without notifying support</li><li>Logging in from different networks or locations is allowed</li><li>Using different devices is allowed</li><li>Basic account security monitoring still applies</li></ul>"
            },
            {
                q: "What is the Inactivity Policy?",
                a: "<p>To ensure active participation and proper account usage, The Fusion Funded enforces an inactivity rule across all account stages.</p><p><strong>Inactivity Rule:</strong></p><p>If a trading account remains inactive for 14 consecutive days, it will be treated as a hard breach, and the account will be terminated.</p><p>This rule applies to: Challenge accounts and Funded accounts.</p><p><strong>What Counts as Inactivity?</strong></p><ul><li>No trades are placed</li><li>No trading activity occurs</li><li>The account remains idle for 14 continuous days</li></ul><p><strong>How to Avoid Inactivity Breach:</strong></p><ul><li>Place at least one trade within every 14-day period</li><li>Maintain regular trading activity</li></ul>"
            }
        ]
    },
    refunds: {
        title: "Refund Policies",
        questions: [
            {
                q: "What is the Refund Policy?",
                a: "<p>Evaluation fees are not refunded immediately after purchase. However, The Fusion Funded refunds the full challenge fee once a trader successfully completes the evaluation and demonstrates consistent performance on the funded account.</p><p>The challenge fee is refunded with the fourth payout from the funded account.</p><p><strong>To qualify for the refund:</strong></p><ul><li>The trader must reach the funded stage</li><li>The trader must receive four successful payouts</li><li>All trading rules must be followed</li><li>The account must remain in good standing</li></ul><p><strong>When Refunds Are Not Eligible:</strong></p><ul><li>Failed evaluations</li><li>Rule violations</li><li>Account termination</li><li>Inactivity breaches</li><li>Payment disputes or chargebacks</li><li>Personal trading losses or mistakes</li></ul><p><strong>Career Program Opportunity:</strong> Traders who demonstrate consistent performance may qualify for The Fusion Funded Career Program.</p>"
            }
        ]
    }
};

// Show FAQ Category
window.showFaqCategory = function (category) {
    const data = FAQ_DATA[category];
    const categoryDiv = document.getElementById('help-category');
    const mainDiv = document.getElementById('help-main');

    let html = `
        <h3><button class="back-btn" onclick="backToFaqMain()">←</button> ${data.title}</h3>
        <p style="color: #888; font-size: 0.85rem; margin-bottom: 20px;">${data.questions.length} articles</p>
    `;

    data.questions.forEach((item, index) => {
        html += `
            <div class="faq-expandable" id="faq-${category}-${index}">
                <div class="faq-question" onclick="toggleFaqAnswer('${category}', ${index})">
                    <span>${item.q}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="faq-answer">
                    <div class="faq-answer-content">${item.a}</div>
                </div>
            </div>
        `;
    });

    categoryDiv.innerHTML = html;
    mainDiv.style.display = 'none';
    categoryDiv.style.display = 'block';
};

// Toggle FAQ Answer
window.toggleFaqAnswer = function (category, index) {
    const faqItem = document.getElementById(`faq-${category}-${index}`);
    faqItem.classList.toggle('active');
};

// Back to Main FAQ
window.backToFaqMain = function () {
    document.getElementById('help-main').style.display = 'block';
    document.getElementById('help-category').style.display = 'none';
};

// Show Article
window.showArticle = function (category, index) {
    const data = FAQ_DATA[category];
    const article = data.questions[index];
    const articleDiv = document.getElementById('help-article');
    const categoryDiv = document.getElementById('help-category');
    const chatContainer = document.querySelector('.chat-container');

    const html = `
        <div class="article-header">
            <button class="back-btn" onclick="backToCategory('${category}')" style="margin-bottom: 15px;">← Back</button>
            <h2>${article.q}</h2>
            <div class="article-meta">Updated recently</div>
        </div>
        <div class="article-content">
            ${article.a}
        </div>
    `;

    articleDiv.innerHTML = html;
    categoryDiv.style.display = 'none';
    articleDiv.style.display = 'block';
    chatContainer.classList.add('expanded');
};

// Back to Category
window.backToCategory = function (category) {
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.classList.remove('expanded');

    setTimeout(() => {
        document.getElementById('help-article').style.display = 'none';
        document.getElementById('help-category').style.display = 'block';
    }, 100);
};

// Help Search Functionality
const helpSearchInput = document.getElementById('help-search-input');
const helpSearchResults = document.getElementById('help-search-results');
const helpMain = document.getElementById('help-main');
const helpCategory = document.getElementById('help-category');

if (helpSearchInput) {
    helpSearchInput.addEventListener('input', function (e) {
        const query = e.target.value.trim().toLowerCase();

        if (query.length === 0) {
            // Show main help view
            helpSearchResults.style.display = 'none';
            helpMain.style.display = 'block';
            helpCategory.style.display = 'none';
            return;
        }

        // Hide main views and show search results
        helpMain.style.display = 'none';
        helpCategory.style.display = 'none';
        helpSearchResults.style.display = 'block';

        // Search through FAQ data
        const results = searchFAQ(query);
        displaySearchResults(results, query);
    });
}

function searchFAQ(query) {
    const results = [];
    const queryWords = query.split(/\s+/).filter(w => w.length > 0);

    // Search through all categories and questions
    for (const [categoryKey, categoryData] of Object.entries(FAQ_DATA)) {
        categoryData.questions.forEach((item, index) => {
            const questionLower = item.q.toLowerCase();
            const answerLower = item.a.toLowerCase().replace(/<[^>]*>/g, ''); // Strip HTML

            // Calculate relevance score
            let score = 0;

            // Exact phrase match in question (highest priority)
            if (questionLower.includes(query)) {
                score += 100;
            }

            // Word matches in question
            queryWords.forEach(word => {
                if (questionLower.includes(word)) {
                    score += 10;
                }
                if (answerLower.includes(word)) {
                    score += 2;
                }
            });

            // Category title match
            if (categoryData.title.toLowerCase().includes(query)) {
                score += 5;
            }

            if (score > 0) {
                results.push({
                    category: categoryKey,
                    categoryTitle: categoryData.title,
                    question: item.q,
                    answer: item.a,
                    index: index,
                    score: score
                });
            }
        });
    }

    // Sort by relevance score (highest first)
    results.sort((a, b) => b.score - a.score);

    return results;
}

function displaySearchResults(results, query) {
    if (results.length === 0) {
        helpSearchResults.innerHTML = `
            <div class="search-no-results">
                <p>No results found for "${escapeHtml(query)}"</p>
                <p style="color: #888; font-size: 0.85rem; margin-top: 8px;">Try different keywords or browse categories below</p>
            </div>
        `;
        return;
    }

    let html = `<div class="search-results-header">Found ${results.length} result${results.length !== 1 ? 's' : ''}</div>`;

    // Show top 10 results
    results.slice(0, 10).forEach(result => {
        // Extract preview text from answer
        const plainAnswer = result.answer.replace(/<[^>]*>/g, '').substring(0, 150);

        html += `
            <div class="search-result-item" onclick="showSearchResult('${result.category}', ${result.index})">
                <div class="search-result-category">${escapeHtml(result.categoryTitle)}</div>
                <div class="search-result-question">${highlightQuery(result.question, query)}</div>
                <div class="search-result-preview">${highlightQuery(plainAnswer, query)}...</div>
            </div>
        `;
    });

    helpSearchResults.innerHTML = html;
}

function highlightQuery(text, query) {
    const escaped = escapeHtml(text);
    const queryEscaped = escapeHtml(query);
    const regex = new RegExp(`(${queryEscaped})`, 'gi');
    return escaped.replace(regex, '<mark>$1</mark>');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.showSearchResult = function (category, index) {
    // Clear search
    helpSearchInput.value = '';
    helpSearchResults.style.display = 'none';

    // Show the category with the specific question expanded
    showFaqCategory(category);

    // Expand the specific question
    setTimeout(() => {
        const faqItem = document.getElementById(`faq-${category}-${index}`);
        if (faqItem) {
            faqItem.classList.add('active');
            faqItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
};
