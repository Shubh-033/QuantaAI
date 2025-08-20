/*
  Quanta AI — Interactive frontend logic
  - Message rendering with minimal Markdown
  - Composer interactions (Enter to send, Shift+Enter newline)
  - Suggested actions, new chat, theme toggle
  - Simple toasts and optional attachments
*/

(() => {
  const STORAGE_KEY = "quanta.chat.v2";
  const MAX_CHARS = 3000;
  const API_BASE = window.location.port === '3000' ? '' : 'http://localhost:3000';

  // Elements
  const chatEl = document.getElementById("chat");
  const typingEl = document.getElementById("typing");
  const inputEl = document.getElementById("input");
  const sendBtn = document.getElementById("sendBtn");
  const charCountEl = document.querySelector(".char-count");
  const suggestedButtons = Array.from(document.querySelectorAll(".action-btn"));
  const navLinks = Array.from(document.querySelectorAll(".nav-item .nav-link"));
  const newChatBtn = document.querySelector(".new-chat-btn");
  const optionBtns = Array.from(document.querySelectorAll(".composer-options .option-btn"));
  const themeSwitch = document.querySelector(".toggle-switch");
  const rightActionBtns = Array.from(document.querySelectorAll(".action-icon-btn, .upgrade-btn, .section-menu, .user-avatar-small"));
  const chatItems = Array.from(document.querySelectorAll(".chat-item"));

  // State
  let messages = loadMessages();

  if (messages.length === 0) {
    messages.push(createMessage("bot", "Welcome! Ask me anything, or try the quick actions above."));
    saveMessages();
  }

  renderAll();
  updateCharCount();
  autoResize();

  // Event wiring
  sendBtn.addEventListener("click", onSubmit);
  inputEl.addEventListener("keydown", onKeyDown);
  inputEl.addEventListener("input", () => { updateCharCount(); autoResize(); });
  suggestedButtons.forEach(btn => btn.addEventListener("click", onSuggested));
  navLinks.forEach(link => link.addEventListener("click", onNavClick));
  if (newChatBtn) newChatBtn.addEventListener("click", startNewChat);
  optionBtns.forEach((btn, idx) => btn.addEventListener("click", () => onOption(idx)));
  if (themeSwitch) themeSwitch.addEventListener("click", toggleTheme);
  rightActionBtns.forEach(btn => btn.addEventListener("click", () => toast("Action coming soon", 1600)));
  chatItems.forEach(item => item.addEventListener("click", () => toast("Loaded example chat", 1200)));

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }

  async function onSubmit() {
    const text = inputEl.value.trim();
    if (!text) return;

    const userMsg = createMessage("user", text);
    messages.push(userMsg);
    saveMessages();
    appendMessage(userMsg);
    inputEl.value = "";
    updateCharCount();
    autoResize();
    scrollToBottom();

    showTyping(true);
    const reply = await generateLocalReply(text);
    await sleep(450 + Math.min(1200, Math.max(200, reply.length * 8)));
    const botMsg = createMessage("bot", reply);
    messages.push(botMsg);
    saveMessages();
    appendMessage(botMsg);
    showTyping(false);
    scrollToBottom();
  }

  function onSuggested(e) {
    const button = e.currentTarget;
    const label = button.querySelector("span")?.textContent || "";
    const map = {
      "Write copy": "Write a short product blurb for a smart water bottle.",
      "Image generation": "Give me 5 creative prompts to generate a tech-themed hero image.",
      "Create avatar": "Design a playful avatar concept for a coding assistant.",
      "Write code": "Generate a minimal HTML/CSS/JS layout for a pricing page."
    };
    inputEl.value = map[label] || "Tell me something interesting about UI design.";
    updateCharCount();
    autoResize();
    inputEl.focus();
  }

  function onNavClick(e) {
    e.preventDefault();
    navLinks.forEach(l => l.parentElement.classList.remove("active"));
    e.currentTarget.parentElement.classList.add("active");
    toast("Switched section", 1000);
  }

  function startNewChat() {
    messages = [];
    localStorage.removeItem(STORAGE_KEY);
    chatEl.innerHTML = "";
    const welcome = createMessage("bot", "New chat started. How can I help?");
    messages.push(welcome);
    saveMessages();
    appendMessage(welcome);
    toast("New chat created", 1200);
  }

  function onOption(index) {
    if (index === 0) {
      // Attach
      const input = document.createElement("input");
      input.type = "file";
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        const note = createMessage("bot", `Attachment received: \`${file.name}\` (${Math.round(file.size/1024)} KB)`);
        messages.push(note);
        saveMessages();
        appendMessage(note);
      };
      input.click();
    } else if (index === 1) {
      toast("Voice message feature coming soon", 1600);
    } else if (index === 2) {
      const prompts = [
        "Explain closures in JavaScript with examples.",
        "Draft a friendly onboarding email.",
        "Suggest a color palette for a dark fintech dashboard.",
      ];
      inputEl.value = prompts[Math.floor(Math.random() * prompts.length)];
      updateCharCount();
      autoResize();
      toast("Prompt inserted", 1000);
      inputEl.focus();
    }
  }

  function toggleTheme() {
    const isLight = document.body.classList.toggle("light");
    const slider = themeSwitch.querySelector(".toggle-slider");
    slider.style.left = isLight ? "27px" : "3px";
    toast(isLight ? "Light theme" : "Dark theme", 900);
  }

  // Rendering
  function renderAll() {
    chatEl.innerHTML = "";
    for (const msg of messages) appendMessage(msg);
  }

  function appendMessage(msg) {
    const wrapper = document.createElement("div");
    wrapper.className = `message ${msg.role}`;

    const avatar = document.createElement("div");
    avatar.className = "msg-avatar";
    avatar.textContent = msg.role === "user" ? "U" : "Q";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = renderMarkdown(msg.content);

    if (msg.role === "user") {
      wrapper.appendChild(bubble);
      wrapper.appendChild(avatar);
    } else {
      wrapper.appendChild(avatar);
      wrapper.appendChild(bubble);
    }

    chatEl.appendChild(wrapper);
  }

  function showTyping(show) {
    typingEl?.classList.toggle("hidden", !show);
  }

  function updateCharCount() {
    const len = inputEl.value.length;
    charCountEl.textContent = `${len.toLocaleString()}/${MAX_CHARS.toLocaleString()}`;
    if (len > MAX_CHARS) {
      inputEl.value = inputEl.value.slice(0, MAX_CHARS);
    }
  }

  function autoResize() {
    inputEl.style.height = "auto";
    const max = 160;
    inputEl.style.height = Math.min(max, inputEl.scrollHeight + 2) + "px";
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatEl.scrollTo({ top: chatEl.scrollHeight, behavior: "smooth" });
    });
  }

  function saveMessages() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }
  function loadMessages() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  }

  // Groq API integration
  async function generateLocalReply(text) {
    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/json')) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to get AI response');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('API Error:', error);
      return `Sorry, I encountered an error: ${error.message}. Please try again or check your connection.`;
    }
  }

  // Minimal, safe Markdown renderer
  function renderMarkdown(markdown) {
    const text = (markdown || "").replace(/\r\n?/g, "\n");
    const lines = text.split("\n");
    let html = ""; let inUL = false; let inOL = false; let inP = false;
    const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const inline = s => s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
    const closeLists = () => { if (inUL) { html += "</ul>"; inUL=false; } if (inOL) { html += "</ol>"; inOL=false; } };
    const flushP = () => { if (inP) { html += "</p>"; inP=false; } };
    for (let i=0;i<lines.length;i++) {
      const raw = lines[i];
      const ul = raw.match(/^\s*[-*]\s+(.+)$/);
      const ol = raw.match(/^\s*\d+[\.)]\s+(.+)$/);
      if (ul) { flushP(); if (!inUL) { closeLists(); html += "<ul>"; inUL=true; } html += `<li>${inline(esc(ul[1]))}</li>`; continue; }
      if (ol) { flushP(); if (!inOL) { closeLists(); html += "<ol>"; inOL=true; } html += `<li>${inline(esc(ol[1]))}</li>`; continue; }
      if (raw.trim() === "") { closeLists(); flushP(); continue; }
      if (!inP) { closeLists(); html += "<p>"; inP = true; }
      html += inline(esc(raw)); if (i < lines.length - 1) html += "<br>";
    }
    closeLists(); flushP(); return html;
  }

  function toast(message, ms = 1200) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("show"), 10);
    setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 250); }, ms);
  }

  function createMessage(role, content) {
    return { id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`, role, content, ts: Date.now() };
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
})();


