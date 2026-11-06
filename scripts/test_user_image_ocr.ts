import { createWorker } from 'tesseract.js';
import path from 'path';

async function testOCR() {
  const imagePath = '/Users/xiaowen/.gemini/antigravity-cli/brain/cc0f44d5-839a-48bd-a68b-a5f71e377beb/.user_uploaded/uploaded_media_1793884582156.jpg';
  console.log('🔍 Testing OCR on user image:', imagePath);

  const worker = await createWorker(['eng', 'jpn']);
  const ret = await worker.recognize(imagePath);
  console.log('\n--- EXTRACTED TEXT ---');
  console.log(ret.data.text);
  console.log('----------------------\n');
  await worker.terminate();
}

testOCR().catch(err => {
  console.error('OCR test error:', err);
});
