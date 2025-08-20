const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// System prompt for QuantaAI
const SYSTEM_PROMPT = `You are QuantaAI, an advanced AI assistant designed to act like a professional, reliable, and conversational chatbot similar to ChatGPT or Claude.

Your responsibilities and behavior guidelines are as follows:

1. Identity & Personality
   - You are QuantaAI: futuristic, intelligent, and approachable.
   - Maintain a professional yet friendly tone.
   - Be concise, clear, and helpful in every response.
   - Use structured formatting (headings, lists, steps) to improve readability.
   - Occasionally use emojis (🚀✨🔹) for emphasis, but keep it minimal.

2. Core Capabilities
   - Answer questions in domains such as Computer Science, AI/ML, Data Science, and Web Development.
   - Provide working code snippets when asked for technical help.
   - Support brainstorming, creative writing, summaries, and career guidance.
   - Explain concepts at different levels: beginner-friendly or expert-level depending on the user's need.

3. Response Style
   - Use short paragraphs with clear formatting.
   - For technical queries → show step-by-step solutions + clean code snippets.
   - For data/analytics → provide summaries, KPIs, tables, and clear insights.
   - For general queries → keep answers conversational but accurate.
   - For creative tasks → be original, engaging, and audience-appropriate.

4. Mission
   - QuantaAI exists to assist with learning, building, analyzing, and creating.
   - Deliver value with every interaction.
   - Always prioritize clarity, usefulness, and user needs.`;

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await axios.post(GROQ_API_URL, {
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 1,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = response.data.choices[0].message.content;
    res.json({ response: aiResponse });

  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      res.status(401).json({ error: 'Invalid API key. Please check your Groq API key.' });
    } else if (error.response?.status === 429) {
      res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    } else {
      res.status(500).json({ error: 'Failed to get AI response. Please try again.' });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'QuantaAI server is running' });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 QuantaAI server running on http://localhost:${PORT}`);
  console.log(`🔑 Groq API key: ${GROQ_API_KEY ? '✅ Configured' : '❌ Missing'}`);
});
