import { extractPdfText } from '../ocr/pdfText';
import { ocrImage } from '../ocr/tesseract';
import { parseReceiptText } from './extract';
import type { ParsedReceipt } from './types';

export const extractReceiptText = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (isPdf) {
    onProgress?.(0.5);
    const text = await extractPdfText(file);
    onProgress?.(1);
    return text;
  }
  return ocrImage(file, onProgress);
};

export const parseReceiptFile = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<ParsedReceipt> => {
  const text = await extractReceiptText(file, onProgress);
  return parseReceiptText(text);
};
