import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

/**
 * Merges multiple PDF files into a single PDF.
 * @param files Array of File objects
 * @returns Blob of the merged PDF
 */
export async function mergePDFs(files: File[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const donorPdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();
  return new Blob([mergedPdfBytes], { type: 'application/pdf' });
}

/**
 * Zips a list of files.
 */
export async function zipFiles(files: File[], zipName: string): Promise<Blob> {
  const zip = new JSZip();
  
  for (const file of files) {
    zip.file(file.name, await file.arrayBuffer());
  }

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Converts Image files to a single PDF.
 */
export async function imagesToPDF(files: File[]): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const imageBytes = await file.arrayBuffer();
    let image;
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      image = await pdfDoc.embedJpg(imageBytes);
    } else if (file.type === 'image/png') {
      image = await pdfDoc.embedPng(imageBytes);
    } else {
      continue; // Skip unsupported types
    }
    
    // Create a page that matches the image dimensions
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Splits a PDF into multiple single-page PDFs and returns them as a ZIP blob.
 */
export async function splitPDF(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pageCount = pdf.getPageCount();
  
  const zip = new JSZip();
  const baseName = file.name.replace(/\.[^/.]+$/, "");

  for (let i = 0; i < pageCount; i++) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdf, [i]);
    newPdf.addPage(copiedPage);
    
    const pdfBytes = await newPdf.save();
    zip.file(`${baseName}_page_${i + 1}.pdf`, pdfBytes);
  }

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Triggers a browser download for a Blob.
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
