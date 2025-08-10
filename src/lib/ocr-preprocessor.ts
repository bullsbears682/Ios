export class OCRPreprocessor {
  static async preprocessImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          // Set canvas size with proper scaling
          const maxWidth = 2048;
          const maxHeight = 2048;
          let { width, height } = img;
          
          // Scale down if too large
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }
          
          // Draw image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Get image data for processing
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;
          
          // Apply image enhancements
          this.enhanceContrast(data);
          this.sharpenText(data, width, height);
          this.reduceNoise(data);
          
          // Put processed data back
          ctx.putImageData(imageData, 0, 0);
          
          // Convert to high-quality data URL
          const processedDataUrl = canvas.toDataURL('image/png', 1.0);
          resolve(processedDataUrl);
          
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
  
  private static enhanceContrast(data: Uint8ClampedArray) {
    const factor = 1.5; // Contrast enhancement factor
    
    for (let i = 0; i < data.length; i += 4) {
      // Apply contrast to RGB channels
      data[i] = Math.min(255, Math.max(0, ((data[i] - 128) * factor) + 128));     // Red
      data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - 128) * factor) + 128)); // Green
      data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - 128) * factor) + 128)); // Blue
    }
  }
  
  private static sharpenText(data: Uint8ClampedArray, width: number, height: number) {
    const sharpening = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];
    
    const tempData = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        for (let c = 0; c < 3; c++) { // RGB channels
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const kidx = ((y + ky) * width + (x + kx)) * 4 + c;
              sum += tempData[kidx] * sharpening[(ky + 1) * 3 + (kx + 1)];
            }
          }
          data[idx + c] = Math.min(255, Math.max(0, sum));
        }
      }
    }
  }
  
  private static reduceNoise(data: Uint8ClampedArray) {
    // Simple noise reduction by averaging nearby pixels
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Convert to grayscale for better text recognition
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // Apply threshold for better text contrast
      const threshold = gray > 128 ? 255 : 0;
      
      data[i] = threshold;     // Red
      data[i + 1] = threshold; // Green
      data[i + 2] = threshold; // Blue
    }
  }
  
  static extractPLZPatterns(text: string): string[] {
    const patterns = [
      // Standard format: 12345 City
      /\b(\d{5})\s+[A-ZÄÖÜ][a-zäöüß]+/g,
      // With country: D-12345 City or DE-12345 City
      /\b(?:D|DE)-?(\d{5})\s+[A-ZÄÖÜ][a-zäöüß]+/g,
      // In address blocks: Street, 12345 City
      /,\s*(\d{5})\s+[A-ZÄÖÜ][a-zäöüß]+/g,
      // Standalone PLZ
      /\b(\d{5})\b/g,
      // After keywords
      /(?:PLZ|Postleitzahl|postal code)[\s:]*(\d{5})/gi,
      // In structured addresses
      /(\d{5})\s+(?:Berlin|München|Hamburg|Köln|Frankfurt|Stuttgart|Düsseldorf|Dortmund|Essen|Leipzig|Bremen|Dresden|Hannover|Nürnberg|Duisburg)/gi
    ];
    
    const found: string[] = [];
    
    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const plz = match[1];
        if (plz && this.isValidGermanPLZ(plz)) {
          found.push(plz);
        }
      }
    }
    
    // Return unique PLZs, prioritizing those found with city names
    return [...new Set(found)];
  }
  
  static isValidGermanPLZ(plz: string): boolean {
    // German postal codes: 01xxx to 99xxx (excluding some ranges)
    const num = parseInt(plz);
    return num >= 1000 && num <= 99999 && plz.length === 5;
  }
  
  static extractApartmentSize(text: string): number | null {
    const patterns = [
      // Direct m² notation
      /(\d+(?:[.,]\d+)?)\s*m[²2]/gi,
      // Wohnfläche patterns
      /wohnfläche[\s:]*(\d+(?:[.,]\d+)?)\s*m[²2]/gi,
      // Quadratmeter patterns  
      /(\d+(?:[.,]\d+)?)\s*(?:quadratmeter|qm|m[²2])/gi,
      // Size in rental context
      /größe[\s:]*(\d+(?:[.,]\d+)?)\s*m[²2]/gi,
      // Apartment size
      /wohnung[\s:]*(\d+(?:[.,]\d+)?)\s*m[²2]/gi
    ];
    
    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const sizeStr = match[1].replace(',', '.');
        const size = parseFloat(sizeStr);
        if (size >= 10 && size <= 500) { // Reasonable apartment size range
          return size;
        }
      }
    }
    
    return null;
  }
  
  static extractCosts(text: string): { [key: string]: number } {
    const costs: { [key: string]: number } = {};
    
    // Enhanced cost extraction patterns
    const costPatterns = {
      heating: [
        /heiz(?:ung|kosten)[\s\S]*?(\d+[.,]\d{2})/gi,
        /warmwasser[\s\S]*?(\d+[.,]\d{2})/gi,
        /brennstoff[\s\S]*?(\d+[.,]\d{2})/gi,
        /gas[\s\S]*?(\d+[.,]\d{2})/gi
      ],
      water: [
        /(?:kalt)?wasser[\s\S]*?(\d+[.,]\d{2})/gi,
        /wasserkosten[\s\S]*?(\d+[.,]\d{2})/gi,
        /trinkwasser[\s\S]*?(\d+[.,]\d{2})/gi
      ],
      waste: [
        /müll[\s\S]*?(\d+[.,]\d{2})/gi,
        /abfall[\s\S]*?(\d+[.,]\d{2})/gi,
        /entsorgung[\s\S]*?(\d+[.,]\d{2})/gi,
        /müllabfuhr[\s\S]*?(\d+[.,]\d{2})/gi
      ],
      maintenance: [
        /instandhaltung[\s\S]*?(\d+[.,]\d{2})/gi,
        /wartung[\s\S]*?(\d+[.,]\d{2})/gi,
        /reparatur[\s\S]*?(\d+[.,]\d{2})/gi,
        /hausmeister[\s\S]*?(\d+[.,]\d{2})/gi
      ]
    };
    
    for (const [category, patterns] of Object.entries(costPatterns)) {
      let maxCost = 0;
      
      for (const pattern of patterns) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          const costStr = match[1].replace(',', '.');
          const cost = parseFloat(costStr);
          if (cost > 0 && cost < 1000) { // Reasonable cost range
            maxCost = Math.max(maxCost, cost);
          }
        }
      }
      
      if (maxCost > 0) {
        costs[category] = maxCost;
      }
    }
    
    return costs;
  }
}