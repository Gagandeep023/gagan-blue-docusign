// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Add meta tag for document name if it doesn't exist
  if (!document.querySelector('meta[name="doc-name"]')) {
    const meta = document.createElement('meta');
    meta.name = 'doc-name';
    meta.content = document.querySelector('meta[name="doc-name"]')?.content || '';
    document.head.appendChild(meta);
  }

  // Initialize PDF viewer
  const docName = document.querySelector('meta[name="doc-name"]').content;
  const viewer = new PDFViewer('pdf-container', '/documents/' + docName);

  // Initialize buttons
  const addTextBlockButton = document.getElementById('add-text-block');
  const addSignatureBlockButton = document.getElementById('add-signature-block');

  if (addTextBlockButton) {
    addTextBlockButton.addEventListener('click', () => window.blocks.createDraggableBlock('text'));
  }

  if (addSignatureBlockButton) {
    addSignatureBlockButton.addEventListener('click', () => window.blocks.createDraggableBlock('signature'));
  }
}); 