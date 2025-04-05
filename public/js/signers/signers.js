// Global variables
const maxSigners = 5;
let signerCount = 1;
let selectedSignerId = null;
const signerColors = {};

// Utility functions
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function setSignerColor(signerId) {
  if (signerId && !signerColors[signerId]) {
    signerColors[signerId] = getRandomColor();
  }
}

function updateSignerDropdown() {
  const signerOptions = document.getElementById('signer-options');
  signerOptions.innerHTML = '';
  const signerForms = document.querySelectorAll('.signer-form');
  signerForms.forEach(form => {
    const name = form.querySelector('input[name="signerName[]"]').value;
    const id = form.querySelector('input[name="signerId[]"]').value;
    if (name) {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = name;
      signerOptions.appendChild(option);
    }
  });
}

function validateEmail(input) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailError = input.parentElement.querySelector('.email-error');
  const sendButton = document.getElementById('create-doc-for-signing');
  const addTextBlockButton = document.getElementById('add-text-block');
  const addSignatureBlockButton = document.getElementById('add-signature-block');

  if (!emailPattern.test(input.value)) {
    emailError.style.display = 'block';
    sendButton.disabled = true;
    sendButton.style.backgroundColor = '#ccc';
    sendButton.style.cursor = 'not-allowed';
    addTextBlockButton.disabled = true;
    addSignatureBlockButton.disabled = true;
    addTextBlockButton.style.cursor = 'not-allowed';
    addSignatureBlockButton.style.cursor = 'not-allowed';
    addTextBlockButton.style.backgroundColor = '#ccc';
    addSignatureBlockButton.style.backgroundColor = '#ccc';
  } else {
    emailError.style.display = 'none';
    sendButton.disabled = false;
    sendButton.style.backgroundColor = '#28a745';
    sendButton.style.cursor = 'pointer';
    addTextBlockButton.disabled = false;
    addSignatureBlockButton.disabled = false;
    addTextBlockButton.style.cursor = 'pointer';
    addSignatureBlockButton.style.cursor = 'pointer';
    addTextBlockButton.style.backgroundColor = '#007bff';
    addSignatureBlockButton.style.backgroundColor = '#28a745';
    updateSignerDropdown();
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  const addSignerButton = document.getElementById('add-signer');
  const signerSelect = document.getElementById('signer-select');

  if (addSignerButton) {
    addSignerButton.addEventListener('click', function() {
      if (signerCount < maxSigners) {
        signerCount++;
        const signerId = Math.random().toString(36).substr(2, 9);
        const signerForms = document.getElementById('signer-forms');
        const newSignerForm = document.createElement('div');
        newSignerForm.className = 'signer-form';
        newSignerForm.style.marginBottom = '15px';
        newSignerForm.innerHTML = `
          <input type="text" name="signerName[]" placeholder="Signer Name" required style="width: calc(50% - 10px); padding: 10px; margin-right: 10px; border: 1px solid #ccc; border-radius: 4px;">
          <input type="email" name="signerEmail[]" placeholder="Signer Email" required style="width: calc(50% - 10px); padding: 10px; border: 1px solid #ccc; border-radius: 4px;" oninput="validateEmail(this)">
          <div class="email-error" style="color: red; display: none; font-size: 12px;">Please enter a valid email address.</div>
          <input type="hidden" name="signerId[]" value="${signerId}">
        `;
        signerForms.appendChild(newSignerForm);
        document.getElementById('error-message').style.display = 'none';
      } else {
        document.getElementById('error-message').style.display = 'block';
      }
    });
  }


  if (signerSelect) {

    signerSelect.addEventListener('change', function() {
      selectedSignerId = this.value;
      setSignerColor(selectedSignerId);
      console.log('signer-select', selectedSignerId);
    });
  }
});

// Export functions and variables
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    maxSigners,
    signerCount,
    selectedSignerId,
    signerColors,
    getRandomColor,
    setSignerColor,
    updateSignerDropdown,
    validateEmail
  };
} 

window.signers = {
maxSigners,
signerCount,
selectedSignerId,
signerColors,
getRandomColor,
setSignerColor,
updateSignerDropdown,
validateEmail
};
