// Global variables
let pdfLength = null;
let pdfOffsetX = null;
let pdfOffsetY = null;

// Block management functions
function createDraggableBlock(type) {
  if (selectedSignerId === null) {
    alert('Please select a signer first.');
    return;
  }
  const blockId = Math.random().toString(36).substr(2, 9);
  const block = document.createElement('div');
  block.className = 'draggable-block';
  block.style.position = 'absolute';
  block.style.border = '1px solid #000';
  block.style.backgroundColor = '#fff';
  block.style.cursor = 'move';
  block.style.display = 'block';
  
  if (type === 'editable-text') {
    block.style.minWidth = '150px';
    block.style.width = 'auto';
    block.style.display = 'inline-block';
    block.style.padding = '5px';
    block.innerHTML = `
      <div style="display: inline-block; min-width: 100px;">
        <input type="text" class="editable-text-input" placeholder="Enter text here" style="width: 100%; border: none; outline: none; min-width: 150px;">
      </div>
      <input type="hidden" name="blockId[]" value="${blockId}">
      <input type="hidden" name="blockType[]" value="${type}">
      <input type="hidden" name="blockPosition[]" value="0,0">
      <input type="hidden" name="blockPage[]" value="${document.getElementById('current-page').innerText}">
      <input type="hidden" name="signerId[]" value="${selectedSignerId}">
      <input type="hidden" name="blockText[]" value="">
    `;
  } else if (type === 'comment-box') {
    block.style.width = '200px';
    block.style.height = '100px';
    block.style.backgroundColor = '#fff8e1';
    block.style.border = '2px solid #ffc107';
    block.style.borderRadius = '5px';
    // block.style.padding = '10px';
    block.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    block.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
          <span style="font-weight: bold; color: #ff9800;">Comment</span>
          <button class="delete-comment" style="background: none; border: none; cursor: pointer; color: #ff5722;">×</button>
        </div>
        <textarea class="comment-textarea" placeholder="Enter your comment here..." style="flex-grow: 1; border: 1px solid #ffc107; border-radius: 3px; padding: 5px; resize: none; outline: none;"></textarea>
      </div>
      <input type="hidden" name="blockId[]" value="${blockId}">
      <input type="hidden" name="blockType[]" value="${type}">
      <input type="hidden" name="blockPosition[]" value="0,0">
      <input type="hidden" name="blockPage[]" value="${document.getElementById('current-page').innerText}">
      <input type="hidden" name="signerId[]" value="${selectedSignerId}">
      <input type="hidden" name="blockText[]" value="">
    `;
  } else {
    block.innerHTML = `
      <img src="${type === 'text' ? '/public/assets/text-font.png' : '/public/assets/sign-here.jpg'}" alt="${type} icon" style="width: 100px; height: 20px; border: 5px solid ${signerColors[selectedSignerId]}">
      <input type="hidden" name="blockId[]" value="${blockId}">
      <input type="hidden" name="blockType[]" value="${type}">
      <input type="hidden" name="blockPosition[]" value="0,0">
      <input type="hidden" name="blockPage[]" value="${document.getElementById('current-page').innerText}">
      <input type="hidden" name="signerId[]" value="${selectedSignerId}">
    `;
  }
  
  document.getElementById('blocks-container').appendChild(block);
  makeDraggable(block, blockId);
  
  if (type === 'editable-text') {
    const textInput = block.querySelector('.editable-text-input');
    textInput.addEventListener('input', function() {
      block.querySelector('input[name="blockText[]"]').value = this.value;
      
      const tempSpan = document.createElement('span');
      tempSpan.style.visibility = 'hidden';
      tempSpan.style.position = 'absolute';
      tempSpan.style.whiteSpace = 'pre';
      tempSpan.style.font = window.getComputedStyle(textInput).font;
      tempSpan.textContent = this.value || this.placeholder;
      
      document.body.appendChild(tempSpan);
      const contentWidth = Math.max(tempSpan.offsetWidth, 150); // Minimum width of 150px
      document.body.removeChild(tempSpan);
      
      // Set input width to content width
      textInput.style.width = contentWidth + 'px';
      // Set block width to content width + 10px padding on each side
      block.style.width = (contentWidth + 20) + 'px';
    });
    
    textInput.dispatchEvent(new Event('input'));
  } else if (type === 'comment-box') {
    const textarea = block.querySelector('.comment-textarea');
    const deleteButton = block.querySelector('.delete-comment');
    
    textarea.addEventListener('input', function() {
      block.querySelector('input[name="blockText[]"]').value = this.value;
    });
    
    deleteButton.addEventListener('click', function() {
      block.remove();
    });
  }
}

function showBlocksForPage(page) {
  const blocks = document.querySelectorAll('.draggable-block');
  blocks.forEach(block => {
    const blockPage = block.querySelector('input[name="blockPage[]"]').value;
    block.style.display = (blockPage === page.toString()) ? 'block' : 'none';
  });
}

function makeDraggable(element, blockId) {
  const pdfCanvas = document.getElementById('pdf-canvas');

  element.onmousedown = function(e) {
    if (pdfOffsetX === null) {
      pdfOffsetX = e.pageX - element.getBoundingClientRect().left;
    }

    if (pdfOffsetY === null) {
      pdfOffsetY = e.pageY - element.getBoundingClientRect().top;
    }
    
    document.onmousemove = function(e) {
      const newX = e.pageX - pdfOffsetX;
      const newY = e.pageY - pdfOffsetY;

      const containerRect = pdfCanvas.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      if (pdfLength === null) {
        pdfLength = containerRect.bottom;
      }

      const minX = containerRect.left;
      const maxX = containerRect.right - elementRect.width;
      const minY = containerRect.top;
      const maxY = pdfLength - elementRect.height;

      element.style.left = Math.min(Math.max(newX, minX), maxX) + 'px';
      element.style.top = Math.min(Math.max(newY, minY), maxY) + 'px';

      updateBlockPosition(blockId, element.style.left, element.style.top);
    };
    document.onmouseup = function() {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
}

function updateBlockPosition(blockId, left, top) {
  const blockPositionInput = document.querySelector(`input[name="blockId[]"][value="${blockId}"]`).parentElement.querySelector('input[name="blockPosition[]"]');
  blockPositionInput.value = `${left},${top}`;
}

// Document submission
async function submitDocument() {
  alert('Document is being created. Please wait...');

  const docName = document.querySelector('meta[name="doc-name"]').content;
  const signerForms = document.querySelectorAll('.signer-form');
  const signers = Array.from(signerForms).map(form => {
    const name = form.querySelector('input[name="signerName[]"]').value;
    const email = form.querySelector('input[name="signerEmail[]"]').value;
    const id = form.querySelector('input[name="signerId[]"]').value;
    return { name, email, id };
  });

  const pdfCanvas = document.getElementById('pdf-canvas');
  const containerRect = pdfCanvas.getBoundingClientRect();
  const blockLeftBuffer = containerRect.left;
  const blockTopBuffer = containerRect.top;
  const blockWidth = containerRect.width;
  const blockHeight = containerRect.height;

  const blocks = Array.from(document.querySelectorAll('.draggable-block')).map(block => {
    const blockId = block.querySelector('input[name="blockId[]"]').value;
    const blockType = block.querySelector('input[name="blockType[]"]').value;
    const blockPosition = block.querySelector('input[name="blockPosition[]"]').value;
    const blockPage = block.querySelector('input[name="blockPage[]"]').value;
    const blockLeft = Math.floor(((Number(blockPosition.split(',')[0].replace('px', '')) - blockLeftBuffer) / blockWidth) * 600);
    const blockTop = Math.floor(((Number(blockPosition.split(',')[1].replace('px', '')) - blockTopBuffer) / blockHeight) * 820);
    const blockSignerId = block.querySelector('input[name="signerId[]"]').value;
    return { blockId, blockType, blockLeft, blockTop, blockPage, blockSignerId };
  });

  if (signers.some(signer => !signer.name || !signer.email)) {
    alert('Please fill in all signer information.');
    return;
  }

  const data = {
    docName: docName,
    signers: signers,
    blocks: blocks
  };

  try {
    const response = await fetch('/create-doc-for-signing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      window.location.href = `/success?docName=${docName}`;
    } else {
      window.location.href = `/something_went_wrong?docName=${docName}&errorMessage=${response.statusText}`;
    }
  } catch (error) {
    console.error('Error:', error);
    window.location.href = `/failure?docName=${docName}&errorMessage=${error}`;
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  const createDocButton = document.getElementById('create-doc-for-signing');
  if (createDocButton) {
    createDocButton.addEventListener('click', submitDocument);
  }
});

// Export functions and variables
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createDraggableBlock,
    showBlocksForPage,
    makeDraggable,
    updateBlockPosition,
    submitDocument
  };
} else {
  window.blocks = {
    createDraggableBlock,
    showBlocksForPage,
    makeDraggable,
    updateBlockPosition,
    submitDocument
  };
} 