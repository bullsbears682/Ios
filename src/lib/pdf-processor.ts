// PDF processing utilities - client-side only
let pdfjsLib: any = null;

// Dynamically import PDF.js only on client-side
const initPDFJS = async () => {
  if (typeof window === 'undefined') {
    throw new Error('PDF processing is only available on the client-side');
  }
  
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
  
  return pdfjsLib;
};

export class PDFProcessor {
  static async convertPDFToImages(file: File): Promise<string[]> {
    try {
      const pdfjs = await initPDFJS();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const images: string[] = [];

      // Process first 3 pages (utility bills are usually 1-2 pages)
      const maxPages = Math.min(3, pdf.numPages);
      
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // High resolution
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (!context) {
          throw new Error('Canvas context not available');
        }

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas
        };

        await page.render(renderContext).promise;
        
        // Convert to high-quality image
        const imageDataUrl = canvas.toDataURL('image/png', 1.0);
        images.push(imageDataUrl);
      }

      return images;
    } catch (error) {
      console.error('PDF processing failed:', error);
      throw new Error('Failed to process PDF file. Please try with an image format (JPG/PNG) instead.');
    }
  }

  static async extractTextFromPDF(file: File): Promise<string> {
    try {
      const images = await this.convertPDFToImages(file);
      
      // For now, return the first page as image for OCR
      // The calling component will handle OCR processing
      return images[0] || '';
    } catch (error) {
      console.error('PDF text extraction failed:', error);
      throw error;
    }
  }

  static isPDFFile(file: File): boolean {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  }
}