import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure the worker locally for Vite to bundle
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extracts text from the first page of a PDF file.
 */
export async function extractTextFromFirstPage(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument(arrayBuffer);
  const pdf = await loadingTask.promise;
  
  const page = await pdf.getPage(1);
  const textContent = await page.getTextContent();
  
  return textContent.items
    .map((item: any) => item.str)
    .join(' ');
}

/**
 * Suggests a filename based on extracted keywords.
 */
export function suggestFileName(text: string): string {
  // Mock logic: Find pattern like "Plot No: X" or "Dag: Y"
  const plotMatch = text.match(/Plot\s*No[:\s]*(\d+)/i);
  const dagMatch = text.match(/Dag[:\s]*(\d+)/i);
  
  if (plotMatch) return `LandRec_Plot_${plotMatch[1]}.pdf`;
  if (dagMatch) return `LandRec_Dag_${dagMatch[1]}.pdf`;
  
  return `LandRec_Processed_${Date.now()}.pdf`;
}
