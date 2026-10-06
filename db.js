import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firestore = null;
let firebaseInitError = null;
let matchedKeyName = null;

// Initialize Firebase Admin
try {
  let credential = null;
  const keyPath = path.join(__dirname, 'firebase-key.json');

  // Check multiple possible env var names for the service account
  let rawKey = process.env.FIREBASE_SERVICE_ACCOUNT
    || process.env.FIREBASE_KEY
    || process.env.FIREBASE_CONFIG
    || process.env.FIREBASE_CREDENTIALS
    || process.env.FIREBASE_SERVICE_KEY
    || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    || process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (rawKey) {
    matchedKeyName = 'explicit_env_var';
  } else {
    // Scan all env vars for any key containing service account JSON
    for (const [k, v] of Object.entries(process.env)) {
      if (typeof v === 'string' && (v.includes('private_key') || (v.includes('service_account') && v.includes('{')))) {
        rawKey = v;
        matchedKeyName = k;
        break;
      }
    }
  }

  if (rawKey) {
    try {
      rawKey = rawKey.trim();
      // Handle base64 encoded JSON
      if (!rawKey.startsWith('{') && !rawKey.startsWith("'") && !rawKey.startsWith('"')) {
        try {
          const decoded = Buffer.from(rawKey, 'base64').toString('utf8');
          if (decoded.includes('{') && decoded.includes('private_key')) {
            rawKey = decoded.trim();
          }
        } catch (e) {}
      }

      // Strip outer enclosing quotes if added by shell or UI
function formatPemKey(raw) {
  if (!raw) return raw;
  let text = String(raw);
  text = text.replace(/-----BEGIN[ A-Z0-9_-]+-----/gi, '');
  text = text.replace(/-----END[ A-Z0-9_-]+-----/gi, '');
  text = text.replace(/\\n/g, '');
  text = text.replace(/\\r/g, '');
  text = text.replace(/\\/g, '');
  text = text.replace(/\s+/g, '');
  text = text.replace(/['"]+/g, '');
  const chunks = text.match(/.{1,64}/g) || [];
  return '-----BEGIN PRIVATE KEY-----\n' + chunks.join('\n') + '\n-----END PRIVATE KEY-----\n';
}

      if ((rawKey.startsWith("'") && rawKey.endsWith("'")) || 
          (rawKey.startsWith('"') && rawKey.endsWith('"') && rawKey.includes('\\"'))) {
        rawKey = rawKey.slice(1, -1);
      }
      const parsed = JSON.parse(rawKey);
      if (parsed.private_key) {
        parsed.private_key = formatPemKey(parsed.private_key);
      }
      credential = cert(parsed);
    } catch (e) {
      firebaseInitError = `Failed to parse Firebase credentials: ${e.message}`;
      console.error(firebaseInitError);
    }
  } else if (process.env.FIREBASE_PRIVATE_KEY && (process.env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_PROJECT_ID)) {
    try {
      const privateKey = formatPemKey(process.env.FIREBASE_PRIVATE_KEY);
      credential = cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'westy-ai',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@westy-ai.iam.gserviceaccount.com',
        privateKey
      });
    } catch (e) {
      firebaseInitError = `Failed to build credential from individual env vars: ${e.message}`;
      console.error(firebaseInitError);
    }
  } else if (fs.existsSync(keyPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      if (parsed.private_key) {
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
      }
      credential = cert(parsed);
    } catch (e) {
      firebaseInitError = `Failed to read firebase-key.json: ${e.message}`;
      console.error(firebaseInitError);
    }
  }

  if (credential) {
    const app = getApps().length === 0 
      ? initializeApp({ credential }) 
      : getApps()[0];
    firestore = getFirestore(app);
    console.log('✅ Firebase Firestore connected successfully');
  } else {
    if (!firebaseInitError) {
      firebaseInitError = 'No Firebase credentials found in env or file.';
    }
    console.warn('⚠️ No Firebase credentials found. Running in local file fallback mode:', firebaseInitError);
  }
} catch (err) {
  firebaseInitError = `Firebase initialization error: ${err.message}`;
  console.error(firebaseInitError);
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

export { firestore, firebaseInitError, matchedKeyName };
