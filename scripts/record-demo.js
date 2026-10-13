import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function recordStudioDemo() {
  console.log('🎬 Starting Westy Studio 1080p Recording with Motion Simulation & Full Response...');

  const videoDir = path.join(__dirname, '../public/recorded-video');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  // Clear previous recordings
  fs.readdirSync(videoDir).forEach(f => {
    try { fs.unlinkSync(path.join(videoDir, f)); } catch(e){}
  });

  const executablePath = path.join(
    process.env.LOCALAPPDATA,
    'ms-playwright/chromium-1248/chrome-win64/chrome.exe'
  );

  const browser = await chromium.launch({
    executablePath,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  page.on('console', msg => console.log('  [Browser]:', msg.text()));

  try {
    // 1. SCENE: Hero Entrance
    console.log('📍 Scene 1: Capturing Hero Landing Page...');
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 2. SCENE: Motion Glide over Core Features
    console.log('📜 Scene 2: Motion Glide over Core Features...');
    await page.evaluate(() => {
      window.scrollBy({ top: 580, behavior: 'smooth' });
    });
    await page.waitForTimeout(2200);

    // 3. SCENE: Launch into Chat Workspace
    console.log('🚀 Scene 3: Entering Chat Workspace...');
    await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    if (page.url().includes('/login')) {
      console.log('🔑 Authenticating session...');
      await page.fill('input[type="email"]', 'admin@westy.ai');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/chat', { timeout: 10000 });
      await page.waitForTimeout(2000);
    }

    // 4. SCENE: Clicking Suggested Prompt Card on Welcome Screen!
    console.log('💡 Scene 4: Clicking Architecture Prompt Card...');
    const firstPrompt = page.locator('.welcome-prompt').first();
    await firstPrompt.waitFor({ state: 'visible', timeout: 8000 });
    await firstPrompt.click();

    // 5. SCENE: Wait for Streaming AI Response & Render
    console.log('⚡ Scene 5: Streaming real-time response & formatting markdown...');
    // Give 18 seconds for the full response with code blocks to stream in
    await page.waitForTimeout(18000);

    // 6. SCENE: Smooth Cinematic Scroll down through code block
    console.log('📜 Scene 6: Cinematic scroll down through code block...');
    await page.evaluate(() => {
      const messagesContainer = document.querySelector('.chat-messages');
      if (messagesContainer) {
        messagesContainer.scrollBy({ top: 450, behavior: 'smooth' });
      }
    });
    await page.waitForTimeout(3000);

    // 7. SCENE: Voice Waves Motion (Live Audio Waveform)
    console.log('🎙️ Scene 7: Demonstrating Antigravity Voice Waves...');
    const voiceBtn = page.locator('button.chat-voice-btn');
    if (await voiceBtn.isVisible()) {
      await voiceBtn.click();
      await page.waitForTimeout(4000); // 4 full seconds of fluid Sinusoidal waves
    }

    console.log('✨ All scenes recorded with motion and live response!');
  } catch (err) {
    console.error('Recording error:', err);
  } finally {
    await page.close();
    await context.close();
    await browser.close();

    const files = fs.readdirSync(videoDir);
    const videoFile = files.find(f => f.endsWith('.webm'));
    if (videoFile) {
      const srcPath = path.join(videoDir, videoFile);
      const destPath = path.join(__dirname, '../public/westy-demo.webm');
      fs.copyFileSync(srcPath, destPath);
      console.log(`🎉 Studio Demo video saved to: ${destPath}`);
    }
  }
}

recordStudioDemo();
