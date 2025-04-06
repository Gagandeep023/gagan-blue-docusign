class PDFGenerator {
  constructor() {
    this.pdfDoc = null;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.pdfCanvas = document.getElementById('pdf-canvas');
    this.containerRect = this.pdfCanvas ? this.pdfCanvas.getBoundingClientRect() : null;
  }

  async generatePDFWithAnnotations(pdfUrl, blocks) {
    try {
      // Get PDF canvas dimensions and position
      const pdfCanvas = document.getElementById('pdf-canvas');
      const containerRect = pdfCanvas.getBoundingClientRect();
      const blockLeftBuffer = containerRect.left;
      const blockTopBuffer = containerRect.top;
      const blockWidth = containerRect.width;
      const blockHeight = containerRect.height;

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

        // Add annotations for this page with correct positioning
        const pageBlocks = blocks.filter(block => parseInt(block.blockPage) === i)
          .map(block => ({
            ...block,
            // Calculate actual positions relative to PDF dimensions
            actualLeft: Math.floor(((block.blockLeft - blockLeftBuffer) / blockWidth) * viewport.width),
            actualTop: Math.floor(((block.blockTop - blockTopBuffer) / blockHeight) * viewport.height)
          }));

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
      const { blockType, actualLeft, actualTop, blockText } = block;
      console.log(actualLeft, actualTop, viewport);
      
      switch (blockType) {
        case 'editable-text':
          await this.addEditableTextAnnotation(page, blockText, actualLeft, actualTop, viewport);
          break;
        case 'comment-box':
          await this.addCommentAnnotation(page, blockText, actualLeft, actualTop, viewport);
          break;
      }
    }
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
      y: this.scaleY(y + 100, viewport),
      width: 160,
      height: 100,
      color: PDFLib.rgb(1, 0.97, 0.88),
      borderColor: PDFLib.rgb(1, 0.76, 0.03),
      borderWidth: 2,
    });


    page.drawText("Comment", {
        x: this.scaleX(x + 5, viewport),
        y: this.scaleY(y+20, viewport),
        size: 16,
        color: PDFLib.rgb(1, 0.65, 0), // Orange text (#ffa500)
        maxWidth: 190,
    });

    // Add comment text
    page.drawText(text, {
      x: this.scaleX(x + 5, viewport),
      y: this.scaleY(y + 40, viewport),
      size: 14,
      color: PDFLib.rgb(0, 0, 0),
      maxWidth: 190,
    });
  }

  scaleX(x, viewport) {
    return x;  // No need to scale since we're already using PDF coordinates
  }

  scaleY(y, viewport) {
    return viewport.height - y;  // Flip Y coordinate since PDF coordinates start from bottom
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PDFGenerator;
} else {
  window.PDFGenerator = PDFGenerator;
} 