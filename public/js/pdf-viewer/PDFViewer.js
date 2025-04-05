class PDFViewer {
  constructor(containerId, pdfUrl) {
    this.container = document.getElementById(containerId);
    this.pdfUrl = pdfUrl;
    this.currentPage = 1;
    this.scale = 1.5;
    this.pdfDoc = null;
    
    // Add loading indicator
    this.container.innerHTML = '<div style="text-align: center; padding: 20px;">Loading PDF...</div>';
    
    this.init().catch(error => {
      console.error('Error initializing PDF viewer:', error);
      this.container.innerHTML = '<div style="text-align: center; padding: 20px; color: red;">Error loading PDF. Please try again.</div>';
    });
  }
  
  async init() {
    try {
      // Load PDF
      this.pdfDoc = await pdfjsLib.getDocument(this.pdfUrl).promise;
      await this.renderPage(this.currentPage);
      
      // Add controls
      this.addControls();
    } catch (error) {
      console.error('Error in PDF viewer init:', error);
      throw error;
    }
  }
  
  async renderPage(num) {
    try {
      const page = await this.pdfDoc.getPage(num);
      const viewport = page.getViewport({ scale: this.scale });
      
      const canvas = document.createElement('canvas');
      canvas.id = 'pdf-canvas';
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.border = '1px solid #000';
      
      // Clear container
      this.container.innerHTML = '';
      this.container.appendChild(canvas);
      
      // Render PDF page
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // Update page number display
      document.getElementById('current-page').innerText = num;
      window.showBlocksForPage(num); // Show blocks for the current page
    } catch (error) {
      console.error('Error rendering PDF page:', error);
      throw error;
    }
  }
  
  addControls() {
    const controls = document.createElement('div');
    controls.className = 'pdf-controls';
    controls.style.position = 'fixed';
    controls.style.bottom = '20px';
    controls.style.left = '50%';
    controls.style.transform = 'translateX(-50%)';
    controls.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    controls.style.padding = '10px';
    controls.style.borderRadius = '5px';
    controls.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    
    // Zoom controls
    const zoomIn = document.createElement('button');
    zoomIn.textContent = '+';
    zoomIn.style.margin = '0 5px';
    zoomIn.style.padding = '5px 10px';
    zoomIn.onclick = () => {
      this.scale += 0.25;
      this.renderPage(this.currentPage);
    };
    
    const zoomOut = document.createElement('button');
    zoomOut.textContent = '-';
    zoomOut.style.margin = '0 5px';
    zoomOut.style.padding = '5px 10px';
    zoomOut.onclick = () => {
      this.scale = Math.max(0.5, this.scale - 0.25);
      this.renderPage(this.currentPage);
    };
    
    // Page controls
    const prevPage = document.createElement('button');
    prevPage.textContent = 'Previous';
    prevPage.style.margin = '0 5px';
    prevPage.style.padding = '5px 10px';
    prevPage.onclick = () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderPage(this.currentPage);
      }
    };
    
    const nextPage = document.createElement('button');
    nextPage.textContent = 'Next';
    nextPage.style.margin = '0 5px';
    nextPage.style.padding = '5px 10px';
    nextPage.onclick = () => {
      if (this.currentPage < this.pdfDoc.numPages) {
        this.currentPage++;
        this.renderPage(this.currentPage);
      }
    };
    
    controls.appendChild(zoomIn);
    controls.appendChild(zoomOut);
    controls.appendChild(prevPage);
    controls.appendChild(nextPage);
    
    document.body.appendChild(controls);
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PDFViewer;
} else {
  window.PDFViewer = PDFViewer;
} 