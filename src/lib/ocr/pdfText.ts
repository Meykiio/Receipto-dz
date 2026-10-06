import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export const extractPdfText = async (file: File): Promise<string> => {
  const data = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join('\n');
    pages.push(text);
  }

  return pages.join('\n');
};

export const pdfHasTextLayer = async (file: File): Promise<boolean> => {
  const text = await extractPdfText(file);
  const meaningful = text.replace(/[\s\d.,:;|\-_/]/g, '');
  return meaningful.length > 20;
};
