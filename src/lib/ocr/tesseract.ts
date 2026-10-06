import { createWorker, PSM, type Worker } from 'tesseract.js';

// Fully self-hosted Tesseract (worker script, core wasm, traineddata) so OCR
// works offline with zero CDN dependency.
const ASSET_PATH = `${import.meta.env.BASE_URL}tesseract`;

let workerPromise: Promise<Worker> | null = null;

const getWorker = (): Promise<Worker> => {
  if (!workerPromise) {
    workerPromise = createWorker(['fra', 'ara', 'eng'], 1, {
      logger: () => {},
      langPath: ASSET_PATH,
      workerPath: `${ASSET_PATH}/worker.min.js`,
      corePath: ASSET_PATH,
    }).then(async (worker) => {
      // Receipt-appropriate config (Tesseract ImproveQuality guidance):
      // - PSM 6: assume a single uniform block of text
      // - disable dictionaries: receipts are not sentences, word lists hurt
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        load_system_dawg: '0',
        load_freq_dawg: '0',
        user_defined_dpi: '300',
      });
      return worker;
    });
  }
  return workerPromise;
};

// Preprocess a receipt photo for OCR: grayscale + 2x upscale (min 300dpi-ish).
// Boosts accuracy on noisy/low-light phone photos (research-backed).
const preprocessImage = (file: File): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Could not preprocess image'));
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // grayscale
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = data[i + 1] = data[i + 2] = gray;
      }
      ctx.putImageData(imageData, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Could not process image'));
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });

export const ocrImage = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const worker = await getWorker();
  onProgress?.(0.1);

  const processed = await preprocessImage(file);
  onProgress?.(0.35);

  const result = await worker.recognize(processed);
  onProgress?.(1);

  return result.data.text;
};

export const terminateOcr = async (): Promise<void> => {
  if (workerPromise) {
    const worker = await workerPromise;
    await worker.terminate();
    workerPromise = null;
  }
};