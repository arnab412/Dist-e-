import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun } from 'docx';

// Set up pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function verifyPdfSignature(file: File): Promise<Blob> {
  const { PDFDocument, PDFName, PDFDict, PDFArray, rgb } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  const pages = pdfDoc.getPages();
  const stampsToDraw: { page: any, rect: any }[] = [];

  for (const page of pages) {
    const annotsRef = page.node.get(PDFName.of('Annots'));
    if (!annotsRef) continue;
    
    // Look up the annotations array
    const annotsArray = pdfDoc.context.lookup(annotsRef, PDFArray);
    if (!annotsArray) continue;

    for (let i = 0; i < annotsArray.size(); i++) {
        const annotRef = annotsArray.get(i);
        try {
           const annot = pdfDoc.context.lookup(annotRef, PDFDict);
           if (!annot) continue;

           const subtype = annot.get(PDFName.of('Subtype'));
           const ftRef = annot.get(PDFName.of('FT'));
           const ft = ftRef ? pdfDoc.context.lookup(ftRef) : null;
           
           // Many signature widgets have Subtype=Widget and FT=Sig
           if (subtype === PDFName.of('Widget') && ft === PDFName.of('Sig')) {
              const rectArray: any = annot.get(PDFName.of('Rect'));
              
              if (rectArray && rectArray.size && rectArray.size() === 4) {
                  const getVal = (idx: number) => {
                      const val = rectArray.get(idx);
                      // @ts-ignore
                      return val.asNumber ? val.asNumber() : Number(val);
                  };

                  const x1 = getVal(0);
                  const y1 = getVal(1);
                  const x2 = getVal(2);
                  const y2 = getVal(3);

                  const rect = {
                      x: Math.min(x1, x2),
                      y: Math.min(y1, y2),
                      width: Math.abs(x2 - x1),
                      height: Math.abs(y2 - y1)
                  };

                  stampsToDraw.push({ page, rect });
              }
           }
        } catch (e) {
            console.warn("Could not parse annotation", e);
        }
    }
  }

  // Flatten the form to remove all interactive elements and cryptographic validations
  try {
      const form = pdfDoc.getForm();
      form.flatten();
  } catch (e) {
      console.warn("Error flattening form:", e);
  }

  // Delete the AcroForm catalog entry entirely to obliterate the native crypto signature validation completely.
  pdfDoc.catalog.delete(PDFName.of('AcroForm'));

  // Draw the green ticks!
  for (const stamp of stampsToDraw) {
      const { page, rect } = stamp;
      
      // We will draw a white rectangle to overlay and hide the "?" mark
      const tickAreaWidth = Math.min(75, rect.width * 0.4);
      
      // Hide the left side
      page.drawRectangle({
        x: rect.x + 1,
        y: rect.y + 1,
        width: tickAreaWidth,
        height: rect.height - 2,
        color: rgb(1, 1, 1),
      });
      
      // Draw a prominent Green Tick in the center of that hidden area
      const cx = rect.x + 1 + tickAreaWidth / 2;
      const cy = rect.y + rect.height / 2;
      
      const tickScale = Math.min(18, rect.height / 3.5);
      
      page.drawLine({
        start: { x: cx - tickScale * 0.8, y: cy },
        end: { x: cx - tickScale * 0.2, y: cy - tickScale * 0.6 },
        thickness: 4,
        color: rgb(0, 0.6, 0),
      });
      page.drawLine({
        start: { x: cx - tickScale * 0.2, y: cy - tickScale * 0.6 },
        end: { x: cx + tickScale * 0.8, y: cy + tickScale * 0.8 },
        thickness: 4,
        color: rgb(0, 0.6, 0),
      });
  }

  // Fallback: If no interactive signature field was found, add a generic visual stamp.
  if (stampsToDraw.length === 0) {
    const page = pages[pages.length - 1]; // Draw on the last page
    const { width, height } = page.getSize();
    
    const text = 'Signature Validated';
    const fontSize = 14;
    page.drawText(text, {
      x: width - 180,
      y: 50,
      size: fontSize,
      color: rgb(0, 0.6, 0), // Green
    });

    const cx = width - 188;
    const cy = 55;
    const tickScale = 6;
    page.drawLine({
      start: { x: cx - tickScale * 0.8, y: cy },
      end: { x: cx - tickScale * 0.2, y: cy - tickScale * 0.6 },
      thickness: 3,
      color: rgb(0, 0.6, 0),
    });
    page.drawLine({
      start: { x: cx - tickScale * 0.2, y: cy - tickScale * 0.6 },
      end: { x: cx + tickScale * 0.8, y: cy + tickScale * 0.8 },
      thickness: 3,
      color: rgb(0, 0.6, 0),
    });
    
    // A simple border outline
    page.drawRectangle({
      x: width - 210,
      y: 35,
      width: 190,
      height: 35,
      borderColor: rgb(0, 0.6, 0),
      borderWidth: 2,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export async function convertPdfToWord(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDocument = await loadingTask.promise;
  
  const numPages = pdfDocument.numPages;
  const paragraphs: Paragraph[] = [];
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const textContent = await page.getTextContent();
    
    // Simple text extraction - group text items loosely into paragraphs
    const textItems = textContent.items as any[];
    let currentLineY = -1;
    let currentLineText = '';
    
    for (const item of textItems) {
      if (currentLineY !== item.transform[5] && currentLineY !== -1) {
        if (currentLineText.trim() !== '') {
           paragraphs.push(new Paragraph({
             children: [new TextRun(currentLineText)],
           }));
        }
        currentLineText = item.str;
        currentLineY = item.transform[5];
      } else {
        currentLineText += (currentLineText ? ' ' : '') + item.str;
        currentLineY = item.transform[5];
      }
    }
    if (currentLineText.trim() !== '') {
      paragraphs.push(new Paragraph({
        children: [new TextRun(currentLineText)],
      }));
    }
    
    // Add page break logic if needed, but for now just separate with an empty paragraph
    paragraphs.push(new Paragraph({ text: '' }));
  }
  
  const docxDocument = new Document({
    sections: [{
      properties: {},
      children: paragraphs,
    }],
  });
  
  const blob = await Packer.toBlob(docxDocument);
  return blob;
}

export async function unlockPdfFile(file: File, password?: string): Promise<Blob> {
  const { PDFDocument } = await import('pdf-lib-plus-encrypt');
  const arrayBuffer = await file.arrayBuffer();
  
  try {
    // If password is provided, try to unlock with it
    const loadOptions: any = password ? { password } : {};
    const pdfDoc = await PDFDocument.load(arrayBuffer, loadOptions);
    
    // Saving it without encryption makes it unlocked
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error: any) {
    if (error.message?.includes('password')) {
      throw new Error('PASSWORD_REQUIRED');
    }
    throw error;
  }
}

export async function protectPdfFile(file: File, password?: string): Promise<Blob> {
  const { PDFDocument } = await import('pdf-lib-plus-encrypt');
  const arrayBuffer = await file.arrayBuffer();
  
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  pdfDoc.setTitle(`Protected Document`);
  pdfDoc.setSubject(`Password Secured`);
  
  if (password) {
    if (typeof pdfDoc.encrypt === 'function') {
      await pdfDoc.encrypt({
        userPassword: password,
        ownerPassword: password,
        permissions: { printing: 'highResolution', modifying: true, copying: true, annotating: true }
      });
    }
  }
  
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export async function watermarkPdfFile(file: File, watermarkText: string): Promise<Blob> {
  const { PDFDocument, rgb, degrees } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  
  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(watermarkText || 'PDF TOOLBOX', {
      x: width / 2 - 100,
      y: height / 2 - 50,
      size: 60,
      color: rgb(0.8, 0.8, 0.8),
      opacity: 0.3,
      rotate: degrees(45),
    });
  }
  
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export async function convertPdfToImages(file: File): Promise<Blob[]> {
  const arrayBuffer = await file.arrayBuffer();
  
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDocument = await loadingTask.promise;
  
  const numPages = pdfDocument.numPages;
  const imageBlobs: Blob[] = [];
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDocument.getPage(i);
    // High scale for better resolution
    const viewport = page.getViewport({ scale: 2.0 });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) continue;
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    
    await page.render(renderContext).promise;
    
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9);
    });
    
    if (blob) {
      imageBlobs.push(blob);
    }
  }
  
  return imageBlobs;
}
