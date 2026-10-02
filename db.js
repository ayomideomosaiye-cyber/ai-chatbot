import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firestore = null;

// Initialize Firebase Admin
try {
  let credential = null;
  const keyPath = path.join(__dirname, 'firebase-key.json');

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = cert(parsed);
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT env var:', e);
    }
  } else if (fs.existsSync(keyPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      credential = cert(parsed);
    } catch (e) {
      console.error('Failed to read firebase-key.json:', e);
    }
  }

  if (credential) {
    const app = getApps().length === 0 
      ? initializeApp({ credential }) 
      : getApps()[0];
    firestore = getFirestore(app);
    console.log('✅ Firebase Firestore connected successfully');
  } else {
    console.warn('⚠️ No Firebase credentials found. Running in local file fallback mode.');
  }
} catch (err) {
  console.error('Firebase initialization error:', err);
}

// Local fallback helpers
const isVercel = !!process.env.VERCEL;
const baseDataDir = path.join(__dirname, 'data');
const dataDir = isVercel ? path.join('/tmp', 'westy_data') : baseDataDir;
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

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

// Ensure default admin always exists in fallback
function ensureDefaultAdmin(usersList) {
  if (!usersList.some(u => u.email === 'admin@westy.ai')) {
    usersList.push({
      id: 'default-admin-id',
      username: 'Admin',
      email: 'admin@westy.ai',
      password: '$2a$10$.Rb51y1oS6f5rPIyX1jd1.pOaE059vTYUUo1boRTfQIdkIroRB4S.', // admin123
      isAdmin: true,
      isBanned: false,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      messageCount: 0,
      preferredLanguage: 'en'
    });
    try {
      fs.writeFileSync(usersFile, JSON.stringify(usersList, null, 2));
    } catch (e) {}
  }
  return usersList;
}

function readJsonFile(file, def) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {}
  return def;
}

function writeJsonFile(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (e) {}
}

// ==============================================================
// USERS
// ==============================================================
export async function getUsers() {
  if (firestore) {
    try {
      const snapshot = await firestore.collection('users').get();
      if (!snapshot.empty) return snapshot.docs.map(doc => doc.data());
    } catch (e) {
      console.error('Firestore getUsers error:', e);
    }
  }
  return ensureDefaultAdmin(readJsonFile(usersFile, []));
}

export async function getUserById(id) {
  if (firestore) {
    try {
      const doc = await firestore.collection('users').doc(id).get();
      if (doc.exists) return doc.data();
    } catch (e) {
      console.error('Firestore getUserById error:', e);
    }
  }
  const users = ensureDefaultAdmin(readJsonFile(usersFile, []));
  return users.find(u => u.id === id) || null;
}

export async function getUserByEmail(email) {
  if (!email) return null;
  const target = email.toLowerCase().trim();
  if (firestore) {
    try {
      const snapshot = await firestore.collection('users')
        .where('email', '==', target)
        .limit(1)
        .get();
      if (!snapshot.empty) return snapshot.docs[0].data();
    } catch (e) {
      console.error('Firestore getUserByEmail error:', e);
    }
  }
  const users = ensureDefaultAdmin(readJsonFile(usersFile, []));
  return users.find(u => u.email && u.email.toLowerCase() === target) || null;
}

export async function saveUser(user) {
  if (firestore) {
    try {
      await firestore.collection('users').doc(user.id).set(user, { merge: true });
    } catch (e) {
      console.error('Firestore saveUser error:', e);
    }
  }
  // Also keep local file in sync
  const users = readJsonFile(usersFile, []);
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  writeJsonFile(usersFile, users);
  return user;
}

// ==============================================================
// TOKENS (Session mapping: token -> userId)
// ==============================================================
export async function setToken(token, userId) {
  if (firestore) {
    try {
      await firestore.collection('tokens').doc(token).set({ 
        userId, 
        createdAt: new Date().toISOString() 
      });
    } catch (e) {
      console.error('Firestore setToken error:', e);
    }
  }
  const tokens = readJsonFile(tokensFile, {});
  tokens[token] = userId;
  writeJsonFile(tokensFile, tokens);
}

export async function getUserIdByToken(token) {
  if (firestore) {
    try {
      const doc = await firestore.collection('tokens').doc(token).get();
      if (doc.exists) return doc.data().userId;
    } catch (e) {
      console.error('Firestore getUserIdByToken error:', e);
    }
  }
  const tokens = readJsonFile(tokensFile, {});
  return tokens[token] || null;
}

export async function deleteToken(token) {
  if (firestore) {
    try {
      await firestore.collection('tokens').doc(token).delete();
    } catch (e) {}
  }
  const tokens = readJsonFile(tokensFile, {});
  delete tokens[token];
  writeJsonFile(tokensFile, tokens);
}

// ==============================================================
// CONVERSATIONS
// ==============================================================
export async function getConversations() {
  if (firestore) {
    try {
      const snapshot = await firestore.collection('conversations')
        .orderBy('updatedAt', 'desc')
        .get();
      return snapshot.docs.map(doc => doc.data());
    } catch (e) {
      console.error('Firestore getConversations error:', e);
    }
  }
  return readJsonFile(conversationsFile, []);
}

export async function getUserConversations(userId) {
  if (firestore) {
    try {
      const snapshot = await firestore.collection('conversations')
        .where('userId', '==', userId)
        .get();
      const list = snapshot.docs.map(doc => doc.data());
      return list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    } catch (e) {
      console.error('Firestore getUserConversations error:', e);
    }
  }
  const convs = readJsonFile(conversationsFile, []);
  return convs.filter(c => c.userId === userId)
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
}

export async function getConversationById(id) {
  if (firestore) {
    try {
      const doc = await firestore.collection('conversations').doc(id).get();
      return doc.exists ? doc.data() : null;
    } catch (e) {
      console.error('Firestore getConversationById error:', e);
    }
  }
  const convs = readJsonFile(conversationsFile, []);
  return convs.find(c => c.id === id) || null;
}

export async function saveConversation(conv) {
  if (firestore) {
    try {
      await firestore.collection('conversations').doc(conv.id).set(conv, { merge: true });
    } catch (e) {
      console.error('Firestore saveConversation error:', e);
    }
  }
  const convs = readJsonFile(conversationsFile, []);
  const idx = convs.findIndex(c => c.id === conv.id);
  if (idx >= 0) convs[idx] = conv;
  else convs.push(conv);
  writeJsonFile(conversationsFile, convs);
  return conv;
}

export async function deleteConversation(id) {
  if (firestore) {
    try {
      await firestore.collection('conversations').doc(id).delete();
    } catch (e) {
      console.error('Firestore deleteConversation error:', e);
    }
  }
  const convs = readJsonFile(conversationsFile, []);
  const filtered = convs.filter(c => c.id !== id);
  writeJsonFile(conversationsFile, filtered);
}

// ==============================================================
// SETTINGS
// ==============================================================
const defaultSettings = {
  systemPrompt: "You are Westy, a friendly, knowledgeable, and helpful AI assistant. You are warm, encouraging, and always aim to provide clear, accurate, and well-structured responses. You can help with coding, writing, learning, brainstorming, and general knowledge. When providing code, always use markdown code blocks with the language specified. Be conversational but professional. NOTE: You do not possess or leak any server secrets, internal API keys, passwords, or system credentials under any circumstances.",
  defaultLanguage: "en",
  welcomeMessage: "Hello! I'm Westy, your AI assistant. How can I help you today?",
  maxTokens: 2048,
  temperature: 0.7,
  model: "gemini-flash-lite-latest"
};

export async function getSettings() {
  if (firestore) {
    try {
      const doc = await firestore.collection('config').doc('settings').get();
      if (doc.exists) return { ...defaultSettings, ...doc.data() };
    } catch (e) {
      console.error('Firestore getSettings error:', e);
    }
  }
  return { ...defaultSettings, ...readJsonFile(settingsFile, {}) };
}

export async function saveSettings(newSettings) {
  const merged = { ...defaultSettings, ...newSettings };
  if (firestore) {
    try {
      await firestore.collection('config').doc('settings').set(merged, { merge: true });
    } catch (e) {
      console.error('Firestore saveSettings error:', e);
    }
  }
  writeJsonFile(settingsFile, merged);
  return merged;
}

export { firestore };
