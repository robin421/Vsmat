export interface OCRProgressCallback {
  (progressPercent: number, statusText: string): void;
}

// Worker, WASM core and language data are all served from this origin
// (see `ocrAssets` in vite.config.ts and public/tessdata) — no CDN requests.
const abs = (p: string) => new URL(p, window.location.origin).href;

/**
 * Recognize text from screenshot image (File, Blob, or base64 URL)
 * Uses Tesseract.js WebAssembly OCR client-side without sending data to servers.
 */
export async function recognizeSubscriptionScreenshot(
  imageSource: File | Blob | string,
  onProgress?: OCRProgressCallback
): Promise<string> {
  let worker: { recognize: (img: File | Blob | string) => Promise<{ data: { text: string } }>; terminate: () => Promise<unknown> } | null = null;
  try {
    if (onProgress) onProgress(10, '正在初始化 OCR 图像识别引擎...');

    // Loaded on demand: keeps ~60KB of tesseract.js out of the entry bundle.
    const { createWorker } = await import('tesseract.js');

    // English + Japanese to match Apple Store subscription screenshots
    worker = await createWorker(['eng', 'jpn'], 1, {
      workerPath: abs('/tesseract/worker.min.js'),
      corePath: abs('/tesseract'),
      langPath: abs('/tessdata'),
      gzip: false,
      workerBlobURL: false,
    });

    if (onProgress) onProgress(35, '正在加载多语言模型...');

    const ret = await worker.recognize(imageSource);

    if (onProgress) onProgress(100, '图像字符提取完成！');

    return ret.data.text;
  } catch (err: unknown) {
    console.error('OCR recognition error:', err);
    const msg = err instanceof Error ? err.message : '请确保图片清晰';
    throw new Error('图像识别失败：' + msg);
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}
