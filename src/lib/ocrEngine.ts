import { createWorker } from 'tesseract.js';

export interface OCRProgressCallback {
  (progressPercent: number, statusText: string): void;
}

/**
 * Recognize text from screenshot image (File, Blob, or base64 URL)
 * Uses Tesseract.js WebAssembly OCR client-side without sending data to servers.
 */
export async function recognizeSubscriptionScreenshot(
  imageSource: File | Blob | string,
  onProgress?: OCRProgressCallback
): Promise<string> {
  let worker: any = null;
  try {
    if (onProgress) onProgress(10, '正在初始化 OCR 图像识别引擎...');

    // Load English and Japanese by default to match Apple Store subscription screenshots
    worker = await createWorker(['eng', 'jpn']);

    if (onProgress) onProgress(35, '正在加载多语言模型...');

    const ret = await worker.recognize(imageSource);

    if (onProgress) onProgress(100, '图像字符提取完成！');

    return ret.data.text;
  } catch (err: any) {
    console.error('OCR recognition error:', err);
    throw new Error('图像识别失败：' + (err?.message || '请确保图片清晰'));
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}
