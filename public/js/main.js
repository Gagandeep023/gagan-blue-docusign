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
  const addEditableTextButton = document.getElementById('add-editable-text');
  const addCommentBoxButton = document.getElementById('add-comment-box');
  const downloadPdfButton = document.getElementById('download-pdf');

  if (addTextBlockButton) {
    addTextBlockButton.addEventListener('click', () => window.blocks.createDraggableBlock('text'));
  }

  if (addSignatureBlockButton) {
    addSignatureBlockButton.addEventListener('click', () => window.blocks.createDraggableBlock('signature'));
  }

  if (addEditableTextButton) {
    addEditableTextButton.addEventListener('click', () => window.blocks.createDraggableBlock('editable-text'));
  }

  if (addCommentBoxButton) {
    addCommentBoxButton.addEventListener('click', () => window.blocks.createDraggableBlock('comment-box'));
  }

  if (downloadPdfButton) {
    downloadPdfButton.addEventListener('click', async () => {
      try {
        // Show loading indicator
        downloadPdfButton.disabled = true;
        downloadPdfButton.textContent = 'Generating PDF...';

        // Get all blocks
        const blocks = Array.from(document.querySelectorAll('.draggable-block')).map(block => {
          const blockId = block.querySelector('input[name="blockId[]"]').value;
          const blockType = block.querySelector('input[name="blockType[]"]').value;
          const blockPosition = block.querySelector('input[name="blockPosition[]"]').value;
          const blockPage = block.querySelector('input[name="blockPage[]"]').value;
          const blockText = block.querySelector('input[name="blockText[]"]')?.value || '';
          const [blockLeft, blockTop] = blockPosition.split(',').map(coord => 
            parseInt(coord.replace('px', ''))
          );
          return { blockId, blockType, blockLeft, blockTop, blockPage, blockText };
        });

        // Generate PDF with annotations
        const pdfGenerator = new PDFGenerator();
        const pdfBytes = await pdfGenerator.generatePDFWithAnnotations(
          '/documents/' + docName,
          blocks
        );

        // Create download link
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `annotated_${docName}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Reset button state
        downloadPdfButton.disabled = false;
        downloadPdfButton.textContent = 'Download PDF';
      } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Error generating PDF. Please try again.');
        downloadPdfButton.disabled = false;
        downloadPdfButton.textContent = 'Download PDF';
      }
    });
  }
}); 