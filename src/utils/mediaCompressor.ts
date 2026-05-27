import { PDFDocument } from 'pdf-lib';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import imageCompression from 'browser-image-compression';

export async function compressImage(
  file: File, 
  maxMbSize = 0.5, 
  quality = 0.7, 
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const targetBytes = maxMbSize * 1024 * 1024;
  let currentFile: File | Blob = file;
  
  if (onProgress) onProgress(10);
  
  const options = {
    maxSizeMB: maxMbSize,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
    initialQuality: quality,
    onProgress: (p: number) => {
      if (onProgress) onProgress(10 + Math.round((p * 70) / 100)); // Map to 10-80%
    }
  };
  
  let compressedFile: Blob;
  try {
    compressedFile = await imageCompression(file, options);
  } catch (error) {
    console.error("Compression generic error, falling back to canvas:", error);
    compressedFile = file;
  }
  
  if (compressedFile.size <= targetBytes) {
    if (onProgress) onProgress(100);
    return compressedFile;
  }

  if (onProgress) onProgress(85);
  
  // Custom aggressive fallback loop if browser-image-compression failed to meet target size.
  // We use async/await over an image rather than recursion.
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(compressedFile);
    
    img.onload = async () => {
      URL.revokeObjectURL(url);
      
      let currentWidth = img.width;
      let currentHeight = img.height;
      let currentQuality = 0.7;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not available'));
      
      // Let's aggressively drop size if ratio is very bad
      const ratio = targetBytes / compressedFile.size;
      if (ratio < 0.5) {
        currentWidth = Math.floor(currentWidth * Math.sqrt(ratio));
        currentHeight = Math.floor(currentHeight * Math.sqrt(ratio));
      }

      let iterations = 0;
      const MAX_ITERATIONS = 15;

      const attemptCompression = () => {
        if (iterations >= MAX_ITERATIONS) {
           canvas.toBlob(blob => {
             if (onProgress) onProgress(100);
             resolve(blob || compressedFile);
           }, 'image/jpeg', 0.1);
           return;
        }
        iterations++;
        
        canvas.width = Math.max(1, currentWidth);
        canvas.height = Math.max(1, currentHeight);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
               resolve(compressedFile);
               return;
            }
            
            if (blob.size <= targetBytes || (currentWidth <= 150 && currentQuality <= 0.1)) {
              if (onProgress) onProgress(100);
              resolve(blob);
            } else {
              // Adjust for next iteration aggressively
              currentQuality -= 0.15;
              if (currentQuality < 0.1) {
                currentWidth = Math.floor(currentWidth * 0.6);
                currentHeight = Math.floor(currentHeight * 0.6);
                currentQuality = 0.5; // Reset quality but sharply reduce size
              }
              attemptCompression();
            }
          },
          'image/jpeg',
          Math.max(0.01, currentQuality)
        );
      };
      
      attemptCompression();
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(compressedFile); // fallback to original compressed
    };
    
    img.src = url;
  });
}

export async function compressPDF(
  file: File, 
  maxMbSize?: number,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const initialSize = file.size;
  const targetBytes = maxMbSize ? maxMbSize * 1024 * 1024 : initialSize;

  let quality = 0.6;
  let scale = 1.5;

  if (maxMbSize) {
     const ratio = targetBytes / initialSize;
     if (ratio < 0.1) {
       quality = 0.2;
       scale = 0.8;
     } else if (ratio < 0.3) {
       quality = 0.4;
       scale = 1.0;
     } else if (ratio < 0.6) {
       quality = 0.5;
       scale = 1.2;
     }
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const numPages = pdf.numPages;

  let finalBlob: Blob = file; // default to original
  let iterations = 0;
  const MAX_ITERATIONS = 6;

  while(iterations < MAX_ITERATIONS) {
    iterations++;
    const newPdfDoc = await PDFDocument.create();
    
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');
      
      canvas.width = Math.max(1, viewport.width);
      canvas.height = Math.max(1, viewport.height);
      
      await page.render({
        canvasContext: ctx,
        viewport: viewport,
      }).promise;
      
      const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
      const imageBytes = await fetch(jpegDataUrl).then(res => res.arrayBuffer());
      const embedImage = await newPdfDoc.embedJpg(imageBytes);
      
      const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
      newPage.drawImage(embedImage, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      });
      
      if (onProgress) {
        // Calculate sub-progress for this iteration
        const iterationProgress = Math.round((i / numPages) * 100);
        // Only report progress on the first attempt so the bar doesn't jump backwards
        if (iterations === 1) {
           onProgress(iterationProgress);
        }
      }
    }
    
    const pdfBytes = await newPdfDoc.save();
    finalBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    
    if (!maxMbSize || finalBlob.size <= targetBytes) {
      break;
    } else {
      const ratio = targetBytes / finalBlob.size;
      quality = Math.max(0.01, quality * (ratio > 0.8 ? 0.8 : 0.5));
      scale = Math.max(0.1, scale * Math.sqrt(ratio));
    }
  }
  
  return finalBlob;
}
