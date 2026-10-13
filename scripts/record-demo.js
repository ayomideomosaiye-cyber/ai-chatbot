import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function recordDemo() {
  console.log('🎬 Starting automated browser recording for Westy AI...');

  const videoDir = path.join(__dirname, '../public/recorded-video');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  // Launch installed full Chromium with video recording enabled at full 1080p
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

  try {
    console.log('📍 Navigating to Westy Landing Page...');
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Smooth scroll down to capabilities
    console.log('📜 Scrolling through features...');
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
    await page.waitForTimeout(2500);

    // Scroll back to top
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(1500);

    // Click Begin Conversation
    console.log('🚀 Entering Chat...');
    await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // If on login page, fill credentials
    if (page.url().includes('/login')) {
      console.log('🔑 Logging in with default test account...');
      await page.fill('input[type="email"]', 'admin@westy.ai');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/chat', { timeout: 10000 });
      await page.waitForTimeout(2000);
    }

    // Now in Chat Area
    console.log('💬 Executing conversational query...');
    const chatInput = page.locator('textarea.chat-input');
    await chatInput.waitFor({ state: 'visible', timeout: 10000 });

    const samplePrompt = 'Explain event-driven architecture vs request-response and write a clean TypeScript example.';
    // Simulate natural human typing
    for (const char of samplePrompt) {
      await chatInput.type(char, { delay: 35 });
    }
    await page.waitForTimeout(800);

    // Send the prompt
    console.log('⚡ Sending prompt and recording real-time stream...');
    await page.keyboard.press('Enter');

    // Wait for the response to stream in
    await page.waitForTimeout(12000);

    // Scroll down through the response
    await page.evaluate(() => {
      const messagesContainer = document.querySelector('.chat-messages');
      if (messagesContainer) {
        messagesContainer.scrollBy({ top: 400, behavior: 'smooth' });
      }
    });
    await page.waitForTimeout(3000);

    console.log('✨ Recording complete!');
  } catch (err) {
    console.error('Recording error:', err);
  } finally {
    // Closing context finalizes and saves the video
    await page.close();
    await context.close();
    await browser.close();

    // Find the saved video and copy it to public/westy-demo.webm
    const files = fs.readdirSync(videoDir);
    const videoFile = files.find(f => f.endsWith('.webm'));
    if (videoFile) {
      const srcPath = path.join(videoDir, videoFile);
      const destPath = path.join(__dirname, '../public/westy-demo.webm');
      fs.copyFileSync(srcPath, destPath);
      console.log(`🎉 Demo video saved to: ${destPath}`);
    }
  }
}

recordDemo();
