/* ============================================================
   DepEd ID Order Form — script.js
   ============================================================ */

// ── Configuration ────────────────────────────────────────────
// Replace this with your deployed Google Apps Script Web App URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzJ4Oxz6LvqHP9r5_qsZC01B0s_0-WAfRkoy3Afbo2jJv3OasMSFx24wvJ4jHyuig/exec';

// ── File validation rules ────────────────────────────────────
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const ALLOWED_DOC_TYPES   = ['image/jpeg', 'image/png', 'application/pdf'];

// ── DOM references ───────────────────────────────────────────
const form          = document.getElementById('order-form');
const submitBtn     = document.getElementById('submit-btn');
const btnLabel      = document.getElementById('btn-label');
const btnSpinner    = document.getElementById('btn-spinner');
const submitError   = document.getElementById('submit-error');
const successScreen = document.getElementById('success-screen');
const refNumberEl   = document.getElementById('reference-number');

// ── File input listeners ─────────────────────────────────────
document.getElementById('idPhoto').addEventListener('change', function () {
  handlePhotoChange(this);
});

document.getElementById('supportingDoc1').addEventListener('change', function () {
  handleDocChange(this, 'doc1-name', 'doc1-name-wrap', 'upload-area-doc1', 'err-supportingDoc1', ALLOWED_DOC_TYPES);
});

document.getElementById('supportingDoc2').addEventListener('change', function () {
  handleDocChange(this, 'doc2-name', 'doc2-name-wrap', 'upload-area-doc2', 'err-supportingDoc2', ALLOWED_DOC_TYPES);
});

// ── Handle ID photo selection ────────────────────────────────
function handlePhotoChange(input) {
  const errorEl   = document.getElementById('err-idPhoto');
  const previewWrap = document.getElementById('photo-preview-wrap');
  const previewImg  = document.getElementById('photo-preview');
  const uploadArea  = document.getElementById('upload-area-photo');

  clearError(errorEl);

  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const validationError = validateFile(file, ALLOWED_IMAGE_TYPES);

  if (validationError) {
    showError(errorEl, validationError);
    input.value = '';
    return;
  }

  // Show preview
  const reader = new FileReader();
  reader.onload = function (e) {
    previewImg.src = e.target.result;
    previewWrap.classList.remove('hidden');
    uploadArea.classList.add('hidden');
  };
  reader.readAsDataURL(file);
}

// ── Handle document selection ────────────────────────────────
function handleDocChange(input, nameElId, nameWrapId, uploadAreaId, errorElId, allowedTypes) {
  const errorEl    = document.getElementById(errorElId);
  const nameEl     = document.getElementById(nameElId);
  const nameWrap   = document.getElementById(nameWrapId);
  const uploadArea = document.getElementById(uploadAreaId);

  clearError(errorEl);

  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const validationError = validateFile(file, allowedTypes);

  if (validationError) {
    showError(errorEl, validationError);
    input.value = '';
    return;
  }

  nameEl.textContent = file.name;
  nameWrap.classList.remove('hidden');
  uploadArea.classList.add('hidden');
}

// ── Remove a selected file ───────────────────────────────────
function removeFile(inputId, wrapId, uploadAreaId) {
  const input      = document.getElementById(inputId);
  const wrap       = document.getElementById(wrapId);
  const uploadArea = document.getElementById(uploadAreaId);

  input.value = '';
  wrap.classList.add('hidden');
  uploadArea.classList.remove('hidden');

  // Clear any lingering error
  const errorEl = document.getElementById('err-' + inputId);
  if (errorEl) clearError(errorEl);

  // Clear photo preview src
  if (inputId === 'idPhoto') {
    document.getElementById('photo-preview').src = '';
  }
}

// ── File validation helper ───────────────────────────────────
function validateFile(file, allowedTypes) {
  if (!allowedTypes.includes(file.type)) {
    const labels = allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ');
    return `Invalid file type. Allowed: ${labels}.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'File exceeds the 5MB size limit.';
  }
  return null;
}

// ── Form validation ──────────────────────────────────────────
function validateForm() {
  let isValid = true;

  // Text / select fields
  const requiredFields = [
    { id: 'lastName',      label: 'Last Name' },
    { id: 'firstName',     label: 'First Name' },
    { id: 'dateOfBirth',   label: 'Date of Birth' },
    { id: 'contactNumber', label: 'Contact Number' },
    { id: 'email',         label: 'Email Address' },
    { id: 'employeeId',    label: 'Employee / School ID Number' },
    { id: 'position',      label: 'Position / Designation' },
    { id: 'schoolName',    label: 'School Name' },
    { id: 'division',      label: 'Division / District' },
    { id: 'region',        label: 'Region' },
  ];

  requiredFields.forEach(({ id, label }) => {
    const el      = document.getElementById(id);
    const errorEl = document.getElementById('err-' + id);
    const value   = el.value.trim();

    if (!value) {
      showError(errorEl, `${label} is required.`);
      el.classList.add('invalid');
      isValid = false;
    } else {
      clearError(errorEl);
      el.classList.remove('invalid');
      el.classList.add('valid');
    }
  });

  // Email format
  const emailEl    = document.getElementById('email');
  const emailError = document.getElementById('err-email');
  if (emailEl.value.trim() && !isValidEmail(emailEl.value.trim())) {
    showError(emailError, 'Please enter a valid email address.');
    emailEl.classList.add('invalid');
    isValid = false;
  }

  // Contact number — must be 11 digits
  const contactEl    = document.getElementById('contactNumber');
  const contactError = document.getElementById('err-contactNumber');
  if (contactEl.value.trim() && !/^\d{11}$/.test(contactEl.value.trim())) {
    showError(contactError, 'Contact number must be exactly 11 digits.');
    contactEl.classList.add('invalid');
    isValid = false;
  }

  // ID photo — required
  const idPhotoInput = document.getElementById('idPhoto');
  const idPhotoError = document.getElementById('err-idPhoto');
  if (!idPhotoInput.files || idPhotoInput.files.length === 0) {
    showError(idPhotoError, 'ID photo is required.');
    isValid = false;
  }

  return isValid;
}

// ── Live validation on blur ──────────────────────────────────
['lastName','firstName','dateOfBirth','contactNumber','email',
 'employeeId','position','schoolName','division','region'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener('blur', () => {
    const errorEl = document.getElementById('err-' + id);
    if (!el.value.trim()) {
      // Only show error if user has interacted
      return;
    }
    clearError(errorEl);
    el.classList.remove('invalid');
    el.classList.add('valid');

    // Extra format checks on blur
    if (id === 'email' && !isValidEmail(el.value.trim())) {
      showError(errorEl, 'Please enter a valid email address.');
      el.classList.add('invalid');
      el.classList.remove('valid');
    }
    if (id === 'contactNumber' && !/^\d{11}$/.test(el.value.trim())) {
      showError(errorEl, 'Contact number must be exactly 11 digits.');
      el.classList.add('invalid');
      el.classList.remove('valid');
    }
  });

  el.addEventListener('input', () => {
    const errorEl = document.getElementById('err-' + id);
    if (el.value.trim()) {
      clearError(errorEl);
      el.classList.remove('invalid');
    }
  });
});

// ── File to Base64 helper ────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => {
      // result is "data:mime/type;base64,XXXX" — strip the prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Build payload for Apps Script ───────────────────────────
// Apps Script doPost() reads e.parameter (strings) and does not
// natively parse multipart/form-data file blobs, so we encode
// files as base64 strings and send everything as URLSearchParams.
async function buildPayload() {
  const fields = [
    'lastName','firstName','middleName','dateOfBirth',
    'employeeId','position','schoolName','division','region',
    'contactNumber','email',
  ];

  const params = new URLSearchParams();

  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) params.append(id, el.value.trim());
  });

  // Encode each file
  const fileFields = [
    { id: 'idPhoto',        name: 'idPhoto' },
    { id: 'supportingDoc1', name: 'supportingDoc1' },
    { id: 'supportingDoc2', name: 'supportingDoc2' },
  ];

  for (const { id, name } of fileFields) {
    const input = document.getElementById(id);
    if (input.files && input.files[0]) {
      const file   = input.files[0];
      const base64 = await fileToBase64(file);
      params.append(name,                  base64);
      params.append(name + '_filename',    file.name);
      params.append(name + '_mimetype',    file.type);
    }
  }

  return params;
}

// ── Form submit ──────────────────────────────────────────────
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  hideElement(submitError);

  if (!validateForm()) {
    // Scroll to first error
    const firstError = form.querySelector('.invalid, .field-error:not(:empty)');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  setLoading(true);

  try {
    const payload = await buildPayload();

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload.toString(),
    });

    const result = await response.json();

    if (result.status === 'success') {
      refNumberEl.textContent = result.referenceNumber;
      form.classList.add('hidden');
      successScreen.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showSubmitError(result.message || 'Something went wrong. Please try again.');
    }

  } catch (err) {
    showSubmitError('Unable to submit. Please check your connection and try again.');
  } finally {
    setLoading(false);
  }
});

// ── Reset form (Submit Another Order) ────────────────────────
function resetForm() {
  form.reset();
  form.classList.remove('hidden');
  successScreen.classList.add('hidden');

  // Clear all errors and valid states
  form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  form.querySelectorAll('input, select').forEach(el => {
    el.classList.remove('valid', 'invalid');
  });

  // Reset file previews
  removeFile('idPhoto', 'photo-preview-wrap', 'upload-area-photo');
  removeFile('supportingDoc1', 'doc1-name-wrap', 'upload-area-doc1');
  removeFile('supportingDoc2', 'doc2-name-wrap', 'upload-area-doc2');

  hideElement(submitError);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── UI helpers ───────────────────────────────────────────────
function setLoading(loading) {
  submitBtn.disabled = loading;
  btnLabel.textContent = loading ? 'Submitting…' : 'Submit Order';
  btnSpinner.classList.toggle('hidden', !loading);
}

function showError(el, message) {
  if (el) el.textContent = message;
}

function clearError(el) {
  if (el) el.textContent = '';
}

function showSubmitError(message) {
  submitError.textContent = message;
  submitError.classList.remove('hidden');
  submitError.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideElement(el) {
  if (el) el.classList.add('hidden');
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
