import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local manually
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = value;
    }
  });
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Normalize URL paths if Vercel serverless strips /api prefix
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && req.url !== '/' && !req.url.startsWith('/assets')) {
    req.url = `/api${req.url}`;
  }
  loadData();
  next();
});

// Persistent Storage Directory (Supports both Local Node.js and Vercel Serverless /tmp)
const isVercel = !!process.env.VERCEL;
const baseDataDir = path.join(__dirname, 'data');
const dataDir = isVercel ? path.join('/tmp', 'westy_data') : baseDataDir;

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Seed initial files to /tmp when running on Vercel
if (isVercel && fs.existsSync(baseDataDir)) {
  ['users.json', 'conversations.json', 'settings.json'].forEach(file => {
    const src = path.join(baseDataDir, file);
    const dest = path.join(dataDir, file);
    if (!fs.existsSync(dest) && fs.existsSync(src)) {
      try {
        fs.copyFileSync(src, dest);
      } catch (e) {}
    }
  });
}

const usersFile = path.join(dataDir, 'users.json');
const conversationsFile = path.join(dataDir, 'conversations.json');
const settingsFile = path.join(dataDir, 'settings.json');
const tokensFile = path.join(dataDir, 'tokens.json');


let users = [];
let conversations = [];
let settings = {};
const tokens = new Map(); // token -> userId

function loadData() {
  if (fs.existsSync(usersFile)) {
    try {
      users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    } catch (e) { console.error('Error loading users:', e); }
  }
  if (fs.existsSync(conversationsFile)) {
    try {
      conversations = JSON.parse(fs.readFileSync(conversationsFile, 'utf8'));
    } catch (e) { console.error('Error loading conversations:', e); }
  }
  if (fs.existsSync(tokensFile)) {
    try {
      const obj = JSON.parse(fs.readFileSync(tokensFile, 'utf8'));
      Object.entries(obj).forEach(([tok, uId]) => tokens.set(tok, uId));
    } catch (e) { console.error('Error loading tokens:', e); }
  }
  if (fs.existsSync(settingsFile)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    } catch (e) { console.error('Error loading settings:', e); }
  } else {
    settings = {
      systemPrompt: "You are Westy, a friendly, knowledgeable, and helpful AI assistant. You are warm, encouraging, and always aim to provide clear, accurate, and well-structured responses. You can help with coding, writing, learning, brainstorming, and general knowledge. When providing code, always use markdown code blocks with the language specified. Be conversational but professional.",
      defaultLanguage: "en",
      welcomeMessage: "Hello! I'm Westy, your AI assistant. How can I help you today?",
      maxTokens: 2048,
      temperature: 0.7,
      model: "gemini-flash-lite-latest"
    };
    saveSettings();
  }
}

function saveUsers() { fs.writeFileSync(usersFile, JSON.stringify(users, null, 2)); }
function saveConversations() { fs.writeFileSync(conversationsFile, JSON.stringify(conversations, null, 2)); }
function saveSettings() { fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2)); }
function saveTokens() {
  const obj = {};
  tokens.forEach((val, key) => { obj[key] = val; });
  fs.writeFileSync(tokensFile, JSON.stringify(obj, null, 2));
}

loadData();

// Init admin
if (users.length === 0) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('admin123', salt);
  users.push({
    id: crypto.randomUUID(),
    username: 'Admin',
    email: 'admin@westy.ai',
    password: hash,
    isAdmin: true,
    isBanned: false,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    messageCount: 0,
    preferredLanguage: 'en'
  });
  saveUsers();
  console.log('Created default admin user');
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  const userId = tokens.get(token);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user = users.find(u => u.id === userId);
  if (!user || user.isBanned) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  req.user = user;
  next();
}

function adminMiddleware(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

// In-Memory Rate Limiting
const rateLimitMap = new Map();

function rateLimiter(limit = 60, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'client';
    const now = Date.now();
    let record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      rateLimitMap.set(ip, record);
    } else {
      record.count += 1;
    }

    if (record.count > limit) {
      return res.status(429).json({ 
        error: 'Too many requests. Please slow down and wait a minute.' 
      });
    }

    next();
  };
}

app.post('/api/auth/signup', rateLimiter(10, 60000), (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Invalid input. Password must be at least 6 characters.' });
  }
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email already in use' });
  }
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  const isDefaultAdmin = email.toLowerCase() === 'admin@westy.ai';
  const newUser = {
    id: crypto.randomUUID(),
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password: hash,
    isAdmin: isDefaultAdmin,
    isBanned: false,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    messageCount: 0,
    preferredLanguage: 'en'
  };
  users.push(newUser);
  saveUsers();
  const token = crypto.randomUUID();
  tokens.set(token, newUser.id);
  saveTokens();
  const { password: _, ...userWithoutPass } = newUser;
  res.json({ user: userWithoutPass, token });
});

app.post('/api/auth/login', rateLimiter(15, 60000), (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  if (user.isBanned) {
    return res.status(403).json({ error: 'This account has been suspended by an administrator.' });
  }
  user.lastActive = new Date().toISOString();
  saveUsers();
  const token = crypto.randomUUID();
  tokens.set(token, user.id);
  saveTokens();
  const { password: _, ...userWithoutPass } = user;
  res.json({ user: userWithoutPass, token });
});



app.get('/api/auth/me', authMiddleware, (req, res) => {
  const { password: _, ...userWithoutPass } = req.user;
  res.json({ user: userWithoutPass });
});

// Google OAuth: verify Google ID token and create/login user
app.post('/api/auth/google', rateLimiter(15, 60000), async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ error: 'Missing Google credential' });
  }

  try {
    // Verify the Google ID token using Google's tokeninfo endpoint
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!verifyRes.ok) {
      return res.status(401).json({ error: 'Invalid Google credential' });
    }
    const payload = await verifyRes.json();

    const googleEmail = payload.email?.toLowerCase();
    const googleName = payload.name || payload.given_name || googleEmail.split('@')[0];

    if (!googleEmail || payload.email_verified === 'false') {
      return res.status(400).json({ error: 'Google account email not verified' });
    }

    // Find or create user
    let user = users.find(u => u.email.toLowerCase() === googleEmail);

    if (user) {
      // Existing user — update last active
      if (user.isBanned) {
        return res.status(403).json({ error: 'This account has been suspended by an administrator.' });
      }
      user.lastActive = new Date().toISOString();
      saveUsers();
    } else {
      // New user — auto-register
      user = {
        id: crypto.randomUUID(),
        username: googleName,
        email: googleEmail,
        password: bcrypt.hashSync(crypto.randomUUID(), 10), // random password (won't be used)
        isAdmin: false,
        isBanned: false,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        messageCount: 0,
        preferredLanguage: 'en',
        authProvider: 'google'
      };
      users.push(user);
      saveUsers();
    }

    const token = crypto.randomUUID();
    tokens.set(token, user.id);
    saveTokens();
    const { password: _, ...userWithoutPass } = user;
    res.json({ user: userWithoutPass, token });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

const languages = { en: 'English', yo: 'Yoruba', ig: 'Igbo', ha: 'Hausa', pcm: 'Nigerian Pidgin English', zh: 'Chinese (Simplified)', es: 'Spanish', fr: 'French', ar: 'Arabic', hi: 'Hindi', pt: 'Portuguese', ja: 'Japanese', ko: 'Korean', de: 'German', sw: 'Swahili', zu: 'Zulu' };

const personaPrompts = {
  balanced: "You are Westy, a friendly, knowledgeable, and helpful AI assistant. You are warm, encouraging, and always aim to provide clear, accurate, and well-structured responses. When providing code, always use markdown code blocks with the language specified. Be conversational but professional.",
  naija_tech_bro: "Adopt the persona of a sharp, witty Lagos Tech Bro engineer (Westy). Seamlessly blend contemporary Nigerian tech ecosystem slang (chale, sharp, omo, dey play, no cap, senior dev vibes, japa, soft work, wahala no dey finish) with top-tier deep technical competence and razor-sharp clarity. Be engaging, vibrant, and humorous while delivering world-class answers.",
  prof: "Adopt the persona of Professor Westy, a world-class academic mentor and educator. Explain concepts with crystal clarity, starting from first principles, providing illustrative analogies, historical context where relevant, and structured didactic breakdowns that make complex subjects easy to master.",
  pro: "Adopt the persona of an Executive Strategy Director (Westy). Provide crisp, high-impact responses formatted with bulleted executive summaries, clear strategic action items, ROI considerations, and zero fluff. Prioritize decision velocity and clarity.",
  dev: "Adopt the persona of a Principal Systems Architect and Senior 10x Developer (Westy). Focus on clean architecture, performance optimization, error handling, idiomatic code, edge cases, and modern best practices. Avoid redundant boilerplates and explain architectural trade-offs concisely."
};

// Public read-only shared conversation endpoint
app.get('/api/share/:id', (req, res) => {
  const conv = conversations.find(c => c.id === req.params.id);
  if (!conv) return res.status(404).json({ error: 'Shared conversation not found' });

  res.json({
    id: conv.id,
    title: conv.title,
    language: conv.language,
    createdAt: conv.createdAt,
    messages: (conv.messages || []).map(m => ({
      role: m.role,
      text: m.text,
      image: m.image || null,
      timestamp: m.timestamp || conv.createdAt
    }))
  });
});

async function searchWebKnowledge(query) {
  try {
    const cleanQuery = query.replace(/[^\w\s]/gi, ' ').trim();
    if (!cleanQuery) return null;
    
    let facts = [];

    // 1. DuckDuckGo Instant Answer API
    try {
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1`;
      const ddgRes = await fetch(ddgUrl);
      const ddgData = await ddgRes.json();
      if (ddgData.AbstractText) {
        facts.push(`DuckDuckGo Abstract: ${ddgData.AbstractText}`);
      }
      if (ddgData.RelatedTopics && Array.isArray(ddgData.RelatedTopics)) {
        const topRelated = ddgData.RelatedTopics.slice(0, 3).map(r => r.Text).filter(Boolean);
        if (topRelated.length > 0) facts.push(`Context: ${topRelated.join('; ')}`);
      }
    } catch (e) {}

    // 2. Wikipedia Live API
    try {
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&format=json&origin=*`;
      const wikiRes = await fetch(wikiUrl);
      const wikiData = await wikiRes.json();
      if (wikiData.query?.search && wikiData.query.search.length > 0) {
        const topWiki = wikiData.query.search.slice(0, 2).map(r => `${r.title}: ${r.snippet.replace(/<[^>]+>/g, '')}`);
        facts.push(`Wikipedia: ${topWiki.join(' | ')}`);
      }
    } catch (e) {}

    return facts.length > 0 ? facts.join('\n') : null;
  } catch (err) {
    return null;
  }
}

app.post('/api/chat', authMiddleware, rateLimiter(35, 60000), async (req, res) => {
  const { message = '', conversationId, language = 'en', persona = 'balanced', image = null } = req.body;
  const langName = languages[language] || 'English';
  
  let sysInstruction = personaPrompts[persona] || settings.systemPrompt || personaPrompts.balanced;
  if (language !== 'en') {
    sysInstruction += `\n\nIMPORTANT: You MUST respond entirely in ${langName}. Do not respond in English unless explicitly asked.`;
  }

  // Real-world temporal and calendar anchor
  const now = new Date();
  const timeContext = `\n\nREAL-WORLD TEMPORAL ANCHOR:\nThe current real-world date and time is ${now.toUTCString()} (Local: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}). Today is ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. The current year is ${now.getFullYear()}. When asked about the date, day, month, year, time, or current temporal facts, rely on this anchor with 100% confidence.`;
  sysInstruction += timeContext;

  // Real-time live web search integration
  const searchKeywords = /\b(who is|what is|where is|when is|how is|news|today|current|price|search|google|browse|internet|weather|latest|founder|ceo|time|date)\b/i;
  if (message && searchKeywords.test(message)) {
    const webFacts = await searchWebKnowledge(message);
    if (webFacts) {
      sysInstruction += `\n\nLIVE WEB SEARCH RESULTS (Retrieved from the live internet just now):\n${webFacts}\nIncorporate these fresh live web facts into your response to provide an up-to-date answer.`;
    }
  }

  sysInstruction += `\n\nFOLLOW-UP SUGGESTIONS REQUIREMENT:\nAt the very end of your response, ALWAYS append 2 or 3 concise, highly relevant follow-up questions/prompts the user might ask next. Format them EXACTLY as:\n<<<SUGGESTIONS: ["Prompt 1", "Prompt 2", "Prompt 3"]>>>\nDo not omit this tag.`;
  
  let conv = conversationId ? conversations.find(c => c.id === conversationId) : null;
  let contents = [];
  
  if (conv && conv.userId === req.user.id) {
    contents = conv.messages.map(m => {
      const parts = [];
      if (m.image && m.image.data && m.image.mimeType) {
        parts.push({
          inlineData: {
            mimeType: m.image.mimeType,
            data: m.image.data
          }
        });
      }
      if (m.text) {
        parts.push({ text: m.text });
      }
      return { role: m.role === 'ai' ? 'model' : m.role, parts: parts.length > 0 ? parts : [{ text: '...' }] };
    });
  } else {
    conv = {
      id: crypto.randomUUID(),
      userId: req.user.id,
      title: 'New Chat',
      language,
      persona,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    conversations.push(conv);
  }
  
  const userParts = [];
  if (image && image.data && image.mimeType) {
    userParts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: image.data
      }
    });
  }
  
  const promptText = message.trim() || (image ? "Please analyze and explain what you see in this image in detail." : "Hello");
  userParts.push({ text: promptText });
  
  const newMsg = {
    role: 'user',
    text: message.trim() || (image ? "Shared an image for analysis" : ""),
    image: image ? { mimeType: image.mimeType, data: image.data } : null,
    timestamp: new Date().toISOString()
  };
  conv.messages.push(newMsg);
  contents.push({ role: 'user', parts: userParts });
  
  if (conv.messages.filter(m => m.role === 'user').length === 1 && conv.title === 'New Chat') {
    const rawTitle = message.trim() || (image ? 'Image Analysis' : 'New Chat');
    conv.title = rawTitle.substring(0, 50) + (rawTitle.length > 50 ? '...' : '');
  }
  
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:streamGenerateContent?alt=sse&key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: sysInstruction }] },
        generationConfig: { maxOutputTokens: settings.maxTokens, temperature: settings.temperature }
      })
    });
    
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`API error: ${response.status} - ${err}`);
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Conversation-Id', conv.id);
    res.setHeader('Access-Control-Expose-Headers', 'X-Conversation-Id');

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let aiText = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
        
        const lines = chunk.split('\n');
        for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try {
                    const data = JSON.parse(line.substring(6));
                    const part = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (part) aiText += part;
                } catch (e) {}
            }
        }
    }
    
    conv.messages.push({ role: 'ai', text: aiText, timestamp: new Date().toISOString() });
    conv.updatedAt = new Date().toISOString();
    
    const user = users.find(u => u.id === req.user.id);
    if (user) {
        user.messageCount = (user.messageCount || 0) + 1;
        saveUsers();
    }
    
    saveConversations();
    res.end();
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});


app.get('/api/conversations', authMiddleware, (req, res) => {
  const userConvs = conversations
    .filter(c => c.userId === req.user.id)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map(c => ({ id: c.id, title: c.title, language: c.language, updatedAt: c.updatedAt, messageCount: c.messages.length }));
  res.json(userConvs);
});

app.post('/api/conversations', authMiddleware, (req, res) => {
  const { title, language } = req.body;
  const conv = {
    id: crypto.randomUUID(),
    userId: req.user.id,
    title: title || 'New Chat',
    language: language || 'en',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  conversations.push(conv);
  saveConversations();
  res.json(conv);
});

app.get('/api/conversations/:id', authMiddleware, (req, res) => {
  const conv = conversations.find(c => c.id === req.params.id && c.userId === req.user.id);
  if (!conv) return res.status(404).json({ error: 'Not found' });
  res.json(conv);
});

app.delete('/api/conversations/:id', authMiddleware, (req, res) => {
  const idx = conversations.findIndex(c => c.id === req.params.id && c.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  conversations.splice(idx, 1);
  saveConversations();
  res.json({ success: true });
});

app.get('/api/admin/stats', authMiddleware, adminMiddleware, (req, res) => {
  const totalUsers = users.length;
  const totalMessages = users.reduce((sum, u) => sum + (u.messageCount || 0), 0);
  const totalConversations = conversations.length;
  
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const activeToday = users.filter(u => new Date(u.lastActive) > oneDayAgo).length;
  
  const langCounts = {};
  conversations.forEach(c => {
    const lang = c.language || 'en';
    langCounts[lang] = (langCounts[lang] || 0) + 1;
  });
  const languageBreakdown = Object.entries(langCounts).map(([code, count]) => ({
    code,
    name: languages[code] || code,
    count,
    percentage: totalConversations ? Math.round((count / totalConversations) * 100) : 0
  }));
  
  const recentActivity = conversations
    .slice()
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, 10)
    .map(c => {
      const u = users.find(user => user.id === c.userId);
      return { 
        id: c.id, 
        title: c.title || 'New Chat', 
        username: u ? u.username : 'Guest',
        time: new Date(c.updatedAt || c.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    });
    
  res.json({ totalUsers, totalMessages, totalConversations, activeToday, languageBreakdown, recentActivity });
});

app.get('/api/admin/users', authMiddleware, adminMiddleware, (req, res) => {
  res.json(users.map(({ password, ...u }) => u));
});

app.put('/api/admin/users/:id/ban', authMiddleware, adminMiddleware, (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Cannot ban yourself' });
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  user.isBanned = !user.isBanned;
  saveUsers();
  const { password, ...userWithoutPass } = user;
  res.json(userWithoutPass);
});

app.get('/api/admin/conversations', authMiddleware, adminMiddleware, (req, res) => {
  const mapped = conversations.map(c => {
    const u = users.find(user => user.id === c.userId);
    return { ...c, username: u ? u.username : 'Unknown' };
  }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json(mapped);
});

app.get('/api/admin/conversations/:id', authMiddleware, adminMiddleware, (req, res) => {
  const c = conversations.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const u = users.find(user => user.id === c.userId);
  res.json({ ...c, username: u ? u.username : 'Unknown' });
});

app.get('/api/admin/settings', authMiddleware, adminMiddleware, (req, res) => {
  res.json(settings);
});

app.put('/api/admin/settings', authMiddleware, adminMiddleware, (req, res) => {
  settings = { ...settings, ...req.body };
  saveSettings();
  res.json(settings);
});

const distDir = path.join(__dirname, 'dist');
if (!isVercel && fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`Westy server running on port ${PORT}`);
  });
}

export default app;

