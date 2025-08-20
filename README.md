🤖 QuantaAI – LLM Powered Chatbot

QuantaAI is a ChatGPT-style conversational AI assistant built using Node.js, Express, and Vanilla JavaScript, powered by the Groq API (LLaMA3 model).
It delivers a dark-themed, responsive chatbot interface with real-time AI responses, context memory, and document handling capabilities.

✨ Features
💻 Chat & AI

Context-aware conversations

Real AI responses via Groq LLaMA3-8B

Markdown/code block rendering

Typing indicators for a real-time feel

Graceful error handling (rate limits, invalid keys)

🎨 UI/UX

Dark, futuristic interface with gradient accents

Responsive layout (desktop & mobile)

Smooth animations & hover effects

Sidebar navigation & quick prompts

Theme toggle (dark/light mode)

📂 Extra Capabilities

File upload placeholder (PDFs, documents)

Quick prompts for coding, design, and content

LocalStorage chat history

Health check API endpoint

🛠 Tech Stack

Frontend:

HTML5, CSS3 (Flexbox & Grid)

Vanilla JavaScript (ES6+)

Backend:

Node.js + Express

Axios (Groq API requests)

Dotenv (API key management)

CORS enabled

AI Integration:

Groq API → llama3-8b-8192

Configurable temperature, tokens, and prompts

System prompt for QuantaAI’s personality

⚡ Quick Start
Prerequisites

Node.js v16+

npm or yarn

Groq API Key (Get it free
)

Installation
# Clone repo
git clone https://github.com/Shubh-033/quanta-ai-chatbot.git
cd quanta-ai-chatbot

# Install dependencies
npm install

Configure Environment

Create a .env file in the root:

GROQ_API_KEY=your_groq_api_key_here
PORT=3000

Run the App
# Start server
npm start

# Or dev mode (auto restart)
npm run dev


Now open 👉 http://localhost:3000 in your browser.

📡 API Endpoints
Health Check
GET /api/health
Response: {"status":"OK","message":"QuantaAI server is running"}

Chat Completion
POST /api/chat
{
  "message": "Explain closures in JavaScript"
}
Response:
{
  "response": "Closures are functions that..."
}