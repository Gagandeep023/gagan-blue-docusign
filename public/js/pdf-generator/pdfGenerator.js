class PDFGenerator {
  constructor() {
    this.pdfDoc = null;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  async generatePDFWithAnnotations(pdfUrl, blocks) {
    try {
      // Load the original PDF
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      this.pdfDoc = await loadingTask.promise;

      // Create a new PDF document
      const newPdfDoc = await PDFLib.PDFDocument.create();
      
      // Process each page
      for (let i = 1; i <= this.pdfDoc.numPages; i++) {
        const page = await this.pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });
        
        // Set canvas dimensions
        this.canvas.width = viewport.width;
        this.canvas.height = viewport.height;
        
        // Render the page
        await page.render({
          canvasContext: this.ctx,
          viewport: viewport
        }).promise;

        // Convert canvas to image
        const imageBytes = await this.canvasToImageBytes();
        
        // Add the page to the new PDF
        const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
        
        // Embed the image
        const image = await newPdfDoc.embedJpg(imageBytes);
        
        // Draw the image
        newPage.drawImage(image, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });

        // Add annotations for this page
        const pageBlocks = blocks.filter(block => parseInt(block.blockPage) === i);
        await this.addAnnotations(newPage, pageBlocks, viewport);
      }

      // Save the PDF
      const pdfBytes = await newPdfDoc.save();
      return pdfBytes;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  async canvasToImageBytes() {
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsArrayBuffer(blob);
      }, 'image/jpeg', 1.0);
    });
  }

  async addAnnotations(page, blocks, viewport) {
    for (const block of blocks) {
      const { blockType, blockLeft, blockTop, blockText } = block;
      
      switch (blockType) {
        case 'text':
          await this.addTextAnnotation(page, blockText, blockLeft, blockTop, viewport);
          break;
        case 'signature':
          await this.addSignatureAnnotation(page, blockLeft, blockTop, viewport);
          break;
        case 'editable-text':
          await this.addEditableTextAnnotation(page, blockText, blockLeft, blockTop, viewport);
          break;
        case 'comment-box':
          await this.addCommentAnnotation(page, blockText, blockLeft, blockTop, viewport);
          break;
      }
    }
  }

  async addTextAnnotation(page, text, x, y, viewport) {
    page.drawText(text, {
      x: this.scaleX(x, viewport),
      y: this.scaleY(y, viewport),
      size: 12,
      color: PDFLib.rgb(0, 0, 0),
    });
  }

  async addSignatureAnnotation(page, x, y, viewport) {
    // Add signature image or text
    page.drawText('Signature', {
      x: this.scaleX(x, viewport),
      y: this.scaleY(y, viewport),
      size: 12,
      color: PDFLib.rgb(0, 0, 0),
    });
  }

  async addEditableTextAnnotation(page, text, x, y, viewport) {
    page.drawText(text, {
      x: this.scaleX(x, viewport),
      y: this.scaleY(y, viewport),
      size: 12,
      color: PDFLib.rgb(0, 0, 0),
    });
  }

  async addCommentAnnotation(page, text, x, y, viewport) {
    // Draw comment box
    page.drawRectangle({
      x: this.scaleX(x, viewport),
      y: this.scaleY(y, viewport),
      width: 200,
      height: 100,
      color: PDFLib.rgb(1, 0.97, 0.88),
      borderColor: PDFLib.rgb(1, 0.76, 0.03),
      borderWidth: 2,
    });

    // Add comment text
    page.drawText(text, {
      x: this.scaleX(x + 5, viewport),
      y: this.scaleY(y + 80, viewport),
      size: 10,
      color: PDFLib.rgb(0, 0, 0),
      maxWidth: 190,
    });
  }

  scaleX(x, viewport) {
    return (x / 600) * viewport.width;
  }

  scaleY(y, viewport) {
    return viewport.height - (y / 820) * viewport.height;
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PDFGenerator;
} else {
  window.PDFGenerator = PDFGenerator;
} 