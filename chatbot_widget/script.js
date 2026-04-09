import { RAW_NEW_INSTRUCTIONS, RAW_QUESTIONS_INSTRUCTIONS, RAW_HFT_FAQ } from './dataset.js';

const CUSTOMER_CARE_NUMBER = "+447861395161";
const WHATSAPP_LINK = "https://wa.me/447861395161";
const TELEGRAM_LINK = "https://t.me/thefusionfunded";
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbwRoeDbrZYDc8sY_LTiKGFj3o0JD_oOjpCRKJmuO8bVRDtYo5pRIZVPCG5sdfKEvYXM/exec";

// Format dataset for the AI context exactly matching the files, overriding where necessary
const KNOWLEDGE_BASE_TEXT = `KNOWLEDGE BASE (Ground Truth):
${RAW_QUESTIONS_INSTRUCTIONS}

UPDATES / OVERRIDES (These facts OVERRIDE the knowledge base above in case of any collisions, these are the absolute truth!):
${RAW_NEW_INSTRUCTIONS}

HFT & ALGO FAQ (Additional Q&A):
${RAW_HFT_FAQ}`;

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
    // Fix HTML entities first
    text = text
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&');

    // Headers
    text = text
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold and italic
    text = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/(?<!\*)\*(?!\*)(.*?)\*(?!\*)/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');

    // Numbered lists: group consecutive lines starting with "1. 2. 3." etc.
    text = text.replace(/((?:^\d+\. .+\n?)+)/gm, (match) => {
        const items = match.trim().split('\n').map(line =>
            `<li>${line.replace(/^\d+\.\s*/, '')}</li>`
        ).join('');
        return `<ol>${items}</ol>`;
    });

    // Bullet lists: group consecutive lines starting with "* " or "- "
    text = text.replace(/((?:^[*\-] .+\n?)+)/gm, (match) => {
        const items = match.trim().split('\n').map(line =>
            `<li>${line.replace(/^[*\-]\s*/, '')}</li>`
        ).join('');
        return `<ul>${items}</ul>`;
    });

    // Paragraphs: split on double newlines, skip already-tagged blocks
    const lines = text.split(/\n\n+/);
    text = lines.map(block => {
        block = block.trim();
        if (!block) return '';
        if (/^<(h[1-3]|ul|ol|li|blockquote|pre)/.test(block)) return block;
        // Single newlines within a paragraph become <br>
        return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    // Remaining single newlines outside blocks
    text = text.replace(/(?<!>)\n(?!<)/g, '<br>');

    return text;
}

// LOCAL FALLBACK MATCHING (In case API fails)
function findBestMatchFallback(userInput) {
    const defaultResponse = "I'm sorry, I couldn't find an exact match for your question. Please try rephrasing or contact our support team for help.";
    if (!userInput) return defaultResponse;

    const query = userInput.toLowerCase();

    // Quick conversational checks
    if (["hello", "hi", "hey", "good morning"].some(g => query === g || query.startsWith(g + ' '))) {
        return "Hello! 👋 I am Rajesh, The Fusion Funded's AI assistant. How can I help you today?";
    }
    if (query.includes("who are you") || query.includes("your name")) {
        return "I'm Rajesh, The Fusion Funded's official AI assistant. I'm here to answer your questions about our rules, challenges, and payouts!";
    }

    // --- Step 1: search FAQ_DATA structured entries ---
    let bestMatch = null;
    let highestScore = 0;

    const queryWords = query.split(/\W+/).filter(w => w.length > 2);

    for (const category in FAQ_DATA) {
        for (const item of FAQ_DATA[category].questions) {
            const questionWords = item.q.toLowerCase().split(/\W+/).filter(w => w.length > 2);
            // score against both the question text AND the answer text
            const answerWords = item.a.replace(/<[^>]*>/g, '').toLowerCase().split(/\W+/).filter(w => w.length > 2);
            const allWords = [...new Set([...questionWords, ...answerWords])];

            let score = 0;
            for (const qw of queryWords) {
                if (allWords.includes(qw)) score++;
            }

            const normalizedScore = queryWords.length > 0 ? score / queryWords.length : 0;
            if (normalizedScore > highestScore) {
                highestScore = normalizedScore;
                bestMatch = item.a;
            }
        }
    }

    if (highestScore >= 0.25 && bestMatch) {
        return bestMatch.replace(/<[^>]*>?/gm, '');
    }

    // --- Step 2: fallback — scan KNOWLEDGE_BASE_TEXT for the most relevant paragraph ---
    const paragraphs = KNOWLEDGE_BASE_TEXT.split(/\n{2,}/).filter(p => p.trim().length > 40);
    let bestPara = null;
    let bestParaScore = 0;

    for (const para of paragraphs) {
        const paraWords = para.toLowerCase().split(/\W+/).filter(w => w.length > 2);
        let score = 0;
        for (const qw of queryWords) {
            if (paraWords.includes(qw)) score++;
        }
        const normalizedScore = queryWords.length > 0 ? score / queryWords.length : 0;
        if (normalizedScore > bestParaScore) {
            bestParaScore = normalizedScore;
            bestPara = para.trim();
        }
    }

    if (bestParaScore >= 0.2 && bestPara) {
        return bestPara;
    }

    return defaultResponse;
}

// Call API endpoint
async function callGroqAPI(userMessage) {
    try {
        const GROQ_API_KEY = "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";
        const systemPrompt = `You are Rajesh, an intelligent assistant for The Fusion Funded, a proprietary trading firm. Your role is to answer questions STRICTLY based on the knowledge base provided below.

IMPORTANT RULES:
1. ONLY use information from the knowledge base below to answer questions
2. If a question is about The Fusion Funded but not in the knowledge base, say: "I don't have that specific information. Please contact support for detailed assistance."
3. For questions unrelated to prop trading, say: "I can only help with The Fusion Funded related questions."
4. Keep responses concise and helpful (aim for 80-150 words)
5. Match the tone and detail level from the knowledge base answers

FORMATTING RULES (follow strictly):
- When listing points or features, always use "- " (dash + space) as the bullet prefix, one per line
- When showing steps, format each as its own line: "Step 1 — [title]: [description]"
- Never use "*" or "•" as bullets, always use "-"
- Use **bold** only for step titles or key terms
- Keep each bullet/step on its own line with a blank line between sections

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
                max_tokens: 350
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
            <a href="${WHATSAPP_LINK}" target="_blank" style="display: flex; align-items: center; gap: 8px; color: #25D366; text-decoration: none; margin-bottom: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                WhatsApp
            </a>
            <a href="${TELEGRAM_LINK}" target="_blank" style="display: flex; align-items: center; gap: 8px; color: #0088cc; text-decoration: none; margin-bottom: 8px;">
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
            <a href="${WHATSAPP_LINK}" target="_blank" style="display: flex; align-items: center; gap: 8px; color: #25D366; text-decoration: none; margin-bottom: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                WhatsApp
            </a>
            <a href="${TELEGRAM_LINK}" target="_blank" style="display: flex; align-items: center; gap: 8px; color: #0088cc; text-decoration: none; margin-bottom: 8px;">
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
            <a href="${WHATSAPP_LINK}" target="_blank" style="display: flex; align-items: center; gap: 8px; color: #25D366; text-decoration: none; margin-bottom: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                WhatsApp
            </a>
            <a href="${TELEGRAM_LINK}" target="_blank" style="display: flex; align-items: center; gap: 8px; color: #0088cc; text-decoration: none; margin-bottom: 8px;">
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
            <a href="${WHATSAPP_LINK}" target="_blank" style="display: flex; align-items: center; gap: 8px; color: #25D366; text-decoration: none; margin-bottom: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                WhatsApp
            </a>
            <a href="${TELEGRAM_LINK}" target="_blank" style="display: flex; align-items: center; gap: 8px; color: #0088cc; text-decoration: none; margin-bottom: 8px;">
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

const FAQ_DATA = {
    evaluation: {
        title: "About The Fusion Funded",
        questions: [
            {
                q: "What is The Fusion Funded?",
                a: "<p>The Fusion Funded is a proprietary trading firm that provides traders with access to funded capital through a structured evaluation process. Our model is specifically designed for traders who use high-frequency trading systems (HFT), automation, and advanced execution strategies to achieve performance efficiently.</p><p>Unlike traditional prop firms, The Fusion Funded allows traders to use HFT-based strategies during the challenge phase, enabling faster completion of evaluation objectives. We operate on a single evaluation model: the <strong>HFT 2.0 Challenge</strong>.</p><p>Traders may also choose to work with our trusted partners, who specialize in high-frequency trading systems and can assist in completing the challenge using advanced trading solutions. All accounts that successfully meet the evaluation criteria are reviewed and transitioned into a funded trading environment where structured risk rules are applied.</p>"
            },
            {
                q: "What makes The Fusion Funded different?",
                a: "<p>The Fusion Funded operates on a performance-driven and execution-flexible model, built specifically for modern traders. Key differences include:</p><ul><li><strong>HFT-enabled challenge phase</strong>: Traders can use high-frequency trading systems, automation, and fast execution strategies.</li><li><strong>Single streamlined evaluation (HFT 2.0)</strong>: No complex multi-phase challenges — one clear path to funding.</li><li><strong>Improved risk structure</strong>: 10% maximum drawdown and 7% daily drawdown.</li><li><strong>Flexible payout structure</strong>: Traders can earn up to 60% → 70% → 80% → 90% profit split.</li><li><strong>Faster progression system</strong>: Designed to allow traders to complete evaluations efficiently.</li></ul>"
            },
            {
                q: "How do I get started?",
                a: "<p>Getting started is simple:</p><p><strong>Step 1 — Choose Your Account:</strong> Select your preferred account size and purchase the HFT 2.0 Challenge.</p><p><strong>Step 2 — Start Trading:</strong> Begin trading on your challenge account. You may trade manually or use HFT systems and automated strategies.</p><p><strong>Step 3 — Achieve the Profit Target:</strong> Reach the required profit target while following all trading rules.</p><p><strong>Step 4 — Account Review:</strong> Once the target is achieved, your account is reviewed to ensure compliance with all rules.</p><p><strong>Step 5 — Get Funded:</strong> After successful review, you will receive your funded account and can begin trading under the funded model.</p>"
            },
            {
                q: "Who can join The Fusion Funded?",
                a: "<p>The Fusion Funded is open to traders worldwide who want to demonstrate their trading skills and access funded capital. Eligibility requirements:</p><ul><li>Must be at least 18 years old</li><li>Must have a valid trading strategy</li><li>Must follow all trading rules and risk guidelines</li></ul><p><strong>Restricted Jurisdictions & Compliance:</strong> We do not provide services to individuals located in or residents of North Korea, Iran, South Sudan, Sudan, or Yemen. We also do not provide services to individuals listed on international sanctions lists, persons with criminal histories involving financial crimes or terrorism, or individuals previously banned due to contract violations.</p>"
            }
        ]
    },
    drawdown: {
        title: "Drawdown & Limits",
        questions: [
            {
                q: "What are the drawdown limits?",
                a: "<p>Maximum Drawdown is 10% and Daily Drawdown is 7%. For complete rules, please see the Trading Rules section.</p>"
            }
        ]
    },
    trading: {
        title: "Trading Rules & Guidelines",
        questions: [
            {
                q: "The Fusion Funded — HFT 2.0 Challenge Model",
                a: "<p>The Fusion Funded operates on a single evaluation system known as the HFT 2.0 Challenge. This model is designed for traders who want to use high-frequency trading systems (HFT), automation, and advanced execution strategies to complete their evaluation efficiently.</p><p>During the challenge phase: HFT strategies are allowed, Tick scalping is allowed, Arbitrage and latency-based strategies are allowed.</p><p>Once funded, all accounts operate under a structured and rule-based environment, where specific trading restrictions apply.</p>"
            },
            {
                q: "Challenge Objectives & Profit Target",
                a: "<p>To successfully complete the HFT 2.0 Challenge, traders must achieve the required profit target, follow all trading rules, and maintain proper risk management. All accounts are reviewed after completion.</p><p><strong>Profit Target:</strong> 10% of the initial account size. Example: For a $100,000 account, Profit Target = $10,000.</p>"
            },
            {
                q: "Drawdown Rules",
                a: "<p><strong>Maximum Overall Drawdown:</strong> Maximum loss allowed is 10% of initial account size.</p><p><strong>Daily Drawdown:</strong> Daily loss limit is 7%.</p><p>Example for a $100,000 account: Maximum Drawdown is $10,000, and Daily Drawdown is $7,000. The account balance or equity must never fall below the defined limits.</p>"
            },
            {
                q: "20% Risk Per Trade Rule",
                a: "<p>A trader can risk a maximum of 20% of the total drawdown allowance in a single trade, and to follow this rule, a mandatory SL on positions is required in order to track and keep the maximum allowed risk under 20%.</p><p>Example for a $100,000 account with $10,000 total drawdown allowed: Maximum Risk Per Trade = $2,000.</p><p>Exceeding this limit at any point during trade execution or exposure calculation will be treated as a violation, regardless of trade outcome. This may be a warning for the first time but is a hard breach afterwards.</p>"
            },
            {
                q: "Consistency Rule",
                a: "<p>A trader’s single trading day or trade must not exceed 30% of total profits. Exceeding this limit will result in a violation.</p><p>For example, if the total profit is $10,000, the maximum allowed from a single day or trade is $3,000.</p>"
            },
            {
                q: "Minimum Trading Days & Minimum Trading Day Rule",
                a: "<p><strong>Minimum Trading Days:</strong> Minimum required trading days is 12 days. Optional add-on reduces this to 7 trading days.</p><p><strong>Minimum Trading Day Rule (Profit-Based):</strong> A trading day will only be counted if the trader places a trade and achieves at least 0.1x (1/10th) of the highest profit on a single trade/day used during the payout cycle. Trades below this threshold will not be counted as valid trading days.</p>"
            },
            {
                q: "Layering Rule",
                a: "<p>Opening more than 3 positions in the same direction on the same instrument simultaneously is not allowed. Adding positions to trades that are already in drawdown, grid trading, or recovery-based entries may be considered a violation.</p><p>In the Challenge Phase, it may be treated as a soft breach. In the Funded Stage, it may be treated as a hard breach.</p>"
            },
            {
                q: "Martingale Rule",
                a: "<p>Martingale trading is strictly prohibited. Martingale includes increasing position size after a loss in an attempt to recover previous losses. The sum of all open positions will be treated as a single combined position.</p><p>If a trader increases total exposure to more than 1.6X after a losing trade, it will be considered a martingale strategy. In the Challenge Phase, this may be treated as a soft breach. In the Funded Stage, this may be treated as a hard breach.</p>"
            },
            {
                q: "Minimum Trade Holding Time",
                a: "<p>This rule applies to <strong>Live Accounts Only</strong>. On funded accounts, each trade must be held for a minimum of 2 minutes.</p><p>Up to 1-2 trades per payout cycle may be ignored. If this limit is exceeded, it will be treated as a soft breach, the payout will be rejected, and the account will be reset to the initial balance.</p>"
            },
            {
                q: "Tick Scalping & Arbitrage",
                a: "<p><strong>Tick Scalping:</strong> Extremely fast trades capturing very small price movements repeatedly. During the challenge phase, tick scalping is allowed. On funded accounts, tick scalping is restricted and excessive use may be treated as a violation.</p><p><strong>Arbitrage Trading:</strong> Exploiting price differences rather than trading market direction. During the challenge phase, arbitrage strategies are allowed. On funded accounts, arbitrage trading is restricted and such activity may be treated as a violation.</p>"
            },
            {
                q: "Trading Behavior Violations",
                a: "<p>The following behaviors are considered violations:</p><ul><li><strong>Toxic Trading Behavior:</strong> Ignoring risk management, reckless trading, trading without a clear strategy.</li><li><strong>Overtrading:</strong> Excessive trades in a short time, continuous entries without proper setup.</li><li><strong>Gambling Behavior:</strong> Random entries, revenge trading, emotion-driven execution.</li><li><strong>Improper Hedging:</strong> Opening opposite trades on same instrument, locking positions.</li><li><strong>Reverse Trading:</strong> Intentionally placing losing trades, offset across accounts.</li><li><strong>One-Sided Bias Trading:</strong> Repeated direction without justification.</li><li><strong>Excessive Risk-Taking / Over-Leveraging:</strong> Repeated max lot size, damaging trades, over-reliance on leverage.</li></ul>"
            },
            {
                q: "Is Weekend Holding Allowed?",
                a: "<p>Yes — Weekend Holding is allowed with prior approval. Traders are permitted to hold positions over the weekend on both challenge and funded accounts, provided approval is obtained before the market closes on Friday.</p><p>Approvals requests can be made through any support method (Whatsapp, Instagram, Email or Contact Us panel). Failure to notify support before market close may result in a violation.</p><p><strong>Important:</strong> Markets may open with price gaps. Increased volatility and slippage can occur. All standard risk rules still apply.</p>"
            },
            {
                q: "Is News Trading Allowed?",
                a: "<p>Yes, News trading is fully allowed. Traders may open, close, and manage positions during high-impact news releases, economic announcements, and volatile market conditions.</p><p>Traders are responsible for managing risk during periods of high volatility. All standard risk rules still apply.</p>"
            },
            {
                q: "What is the Breach System?",
                a: "<p>The Fusion Funded uses a two-tier breach system:</p><p><strong>Soft Breach:</strong> Payout is rejected. Account is reset to initial balance. Account remains active in the same phase.</p><p><strong>Hard Breach:</strong> Account is permanently terminated.</p>"
            }
        ]
    },
    payouts: {
        title: "Withdrawals & Payouts",
        questions: [
            {
                q: "What is the minimum amount required for a withdrawal?",
                a: "<p>Minimum Withdrawal: 1% of the initial account size. Withdrawal requests below this amount cannot be processed.</p>"
            },
            {
                q: "What are the withdrawal methods?",
                a: "<p>Available payout methods may include Cryptocurrency (USDT and other supported assets), UPI transfers, Bank transfers, and E-wallets (where available).</p>"
            },
            {
                q: "What are the requirements before withdrawing?",
                a: "<p>Before submitting a withdrawal request, the following conditions must be met:</p><ul><li>Minimum profit of 1% of account size is achieved</li><li>Minimum trading days requirement is completed (12 days or 7 days with add-on)</li><li>KYC verification is completed and approved</li><li>All trading rules are followed</li><li>No active violations are present</li><li>Account is in profit and above initial balance</li></ul><p><strong>Important Rule:</strong> Once a withdrawal request is submitted: No further trading activity is allowed. Placing trades after requesting a payout will be treated as a violation and may lead to account termination.</p>"
            },
            {
                q: "Payout Cycle and Profit Split",
                a: "<p>The Fusion Funded operates on a structured payout system.</p><p><strong>Payout Cycle:</strong> 18 days. Traders become eligible to request payouts after completing the payout cycle and meeting all requirements.</p><p><strong>Profit Split Structure:</strong> Traders can earn 60% → 70% → 80% → 90% profit split. The Fusion Funded is among the few firms offering 60% profit split from the first payout, with scaling opportunities for higher payouts.</p>"
            },
            {
                q: "How long does it take to receive a withdrawal?",
                a: "<p>Once a withdrawal request is submitted, it is reviewed and processed after eligibility conditions are met. After approval, funds are processed and delivered as soon as possible, depending on the selected payout method. Processing times may vary based on payment method, network conditions, and provider timelines. Delays may occur due to weekends, holidays, or additional verification checks. All payouts are processed securely and efficiently.</p>"
            }
        ]
    },
    operations: {
        title: "Operations & Support",
        questions: [
            {
                q: "How does account operation work?",
                a: "<p>Please refer to the KYC & Compliance section for details about account access, security, and inactivity rules.</p>"
            }
        ]
    },
    compliance: {
        title: "KYC & Security",
        questions: [
            {
                q: "Why is KYC required for my account?",
                a: "<p>Completing KYC is mandatory for:</p><ol><li><strong>Legal & Regulatory Compliance:</strong> Prevents fraud, money laundering, identity misuse.</li><li><strong>Account Security & Protection:</strong> Prevents unauthorized access and identity theft.</li><li><strong>Fair Trading Environment:</strong> Ensures one individual does not operate multiple accounts.</li><li><strong>Payout Eligibility:</strong> Verification must be completed before any payout request.</li></ol>"
            },
            {
                q: "What documents are required for KYC?",
                a: "<p>Submit one valid government-issued photo ID:</p><ul><li>Passport (preferred)</li><li>Driver’s License</li><li>National ID Card</li></ul><p>The document must be valid and not expired, details must be clear, and the name must match the account details exactly.</p>"
            },
            {
                q: "What is the IP Address Policy?",
                a: "<p>There are no strict IP location restrictions for traders. Traders may access their accounts from different locations, devices, or networks. Logging in from multiple locations is allowed.</p><p>However, the following are strictly prohibited: Account sharing, Unauthorized third-party access, Selling or transferring account access, Use of compromised or stolen identities. Standard security monitoring still applies.</p>"
            },
            {
                q: "What is the Inactivity Policy?",
                a: "<p>If a trading account remains inactive for 14 consecutive days, it will be considered a violation and may result in account termination. To avoid this, place at least one trade within every 14-day period to maintain regular account activity.</p>"
            }
        ]
    },
    refunds: {
        title: "Refund Policy",
        questions: [
            {
                q: "What is the refund policy?",
                a: "<p>Evaluation fees are not refunded immediately after purchase. The Fusion Funded offers a performance-based refund system. The challenge fee can be refunded once the trader:</p><ul><li>Successfully reaches the funded stage</li><li>Completes four successful payouts</li><li>Maintains compliance with all trading rules</li><li>Keeps the account in good standing</li></ul><p><strong>Add-On Requirement:</strong> Refund eligibility is only available for traders who have selected the refund add-on at the time of purchase. The refund is processed along with the fourth payout.</p><p>Refunds will not be issued for failed challenges, rule violations, account termination, inactivity breaches, payment disputes, or trading losses.</p>"
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
                <div class="faq-question" onclick="showArticle('${category}', ${index})">
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

    // Open the article directly
    showArticle(category, index);
};
