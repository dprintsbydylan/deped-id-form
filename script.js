/* ============================================================
   DepEd ID Order Form — script.js
   ============================================================ */

// ── Configuration ────────────────────────────────────────────
// Replace with your deployed Google Apps Script Web App URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzJ4Oxz6LvqHP9r5_qsZC01B0s_0-WAfRkoy3Afbo2jJv3OasMSFx24wvJ4jHyuig/exec';

// ── File validation rules ────────────────────────────────────
const MAX_FILE_SIZE_BYTES  = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES  = ['image/jpeg', 'image/png'];
const ALLOWED_DOC_TYPES    = ['image/jpeg', 'image/png', 'application/pdf'];

// ── Required text/select fields ──────────────────────────────
const REQUIRED_FIELDS = [
  { id: 'lastName',               label: 'Last Name' },
  { id: 'firstName',              label: 'First Name' },
  { id: 'dateOfBirth',            label: 'Date of Birth' },
  { id: 'bloodType',              label: 'Blood Type' },
  { id: 'address',                label: 'Address' },
  { id: 'contactNo',              label: 'Contact No.' },
  { id: 'position',               label: 'Position' },
  { id: 'employeeNumber',         label: 'Employee Number' },
  { id: 'nameOfSchool',           label: 'Name of School' },
  { id: 'schoolAddress',          label: 'School Address' },
  { id: 'region',                 label: 'Region' },
  { id: 'schoolsDivisionOf',      label: 'Schools Division Of' },
  { id: 'tin',                    label: 'TIN' },
  { id: 'gsisBpNo',               label: 'GSIS BP No.' },
  { id: 'pagIbigNo',              label: 'Pag-Ibig No.' },
  { id: 'philHealthNo',           label: 'PhilHealth No.' },
  { id: 'emergencyContactName',   label: 'Emergency Contact Name' },
  { id: 'emergencyContactAddress',label: 'Emergency Contact Address' },
  { id: 'emergencyContactNumber', label: 'Emergency Contact Number' },
  { id: 'nameOfSchoolHead',       label: 'Name of School Head' },
  { id: 'schoolHeadPosition',     label: 'School Head Position' },
];

// ── All text/select field IDs (for live validation listeners) ─
const ALL_TEXT_FIELD_IDS = REQUIRED_FIELDS.map(f => f.id);

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
  handleImageChange(this, 'photo-preview', 'photo-preview-wrap', 'upload-area-photo', 'err-idPhoto');
});

document.getElementById('eSignature').addEventListener('change', function () {
  handleImageChange(this, 'esig-preview', 'esig-preview-wrap', 'upload-area-esig', 'err-eSignature');
});

document.getElementById('supportingDoc1').addEventListener('change', function () {
  handleDocChange(this, 'doc1-name', 'doc1-name-wrap', 'upload-area-doc1', 'err-supportingDoc1');
});

document.getElementById('supportingDoc2').addEventListener('change', function () {
  handleDocChange(this, 'doc2-name', 'doc2-name-wrap', 'upload-area-doc2', 'err-supportingDoc2');
});

// ── Handle image file selection (photo / e-signature) ────────
function handleImageChange(input, previewImgId, previewWrapId, uploadAreaId, errorElId) {
  const errorEl    = document.getElementById(errorElId);
  const previewImg = document.getElementById(previewImgId);
  const previewWrap = document.getElementById(previewWrapId);
  const uploadArea  = document.getElementById(uploadAreaId);

  clearError(errorEl);

  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const err  = validateFile(file, ALLOWED_IMAGE_TYPES);

  if (err) {
    showError(errorEl, err);
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    previewImg.src = e.target.result;
    previewWrap.classList.remove('hidden');
    uploadArea.classList.add('hidden');
  };
  reader.readAsDataURL(file);
}

// ── Handle document file selection ──────────────────────────
function handleDocChange(input, nameElId, nameWrapId, uploadAreaId, errorElId) {
  const errorEl    = document.getElementById(errorElId);
  const nameEl     = document.getElementById(nameElId);
  const nameWrap   = document.getElementById(nameWrapId);
  const uploadArea = document.getElementById(uploadAreaId);

  clearError(errorEl);

  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const err  = validateFile(file, ALLOWED_DOC_TYPES);

  if (err) {
    showError(errorEl, err);
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

  const errorEl = document.getElementById('err-' + inputId);
  if (errorEl) clearError(errorEl);

  // Clear image preview src
  if (inputId === 'idPhoto')     document.getElementById('photo-preview').src = '';
  if (inputId === 'eSignature')  document.getElementById('esig-preview').src  = '';
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

  // Required text / select fields
  REQUIRED_FIELDS.forEach(({ id, label }) => {
    const el      = document.getElementById(id);
    const errorEl = document.getElementById('err-' + id);
    if (!el) return;

    if (!el.value.trim()) {
      showError(errorEl, `${label} is required.`);
      el.classList.add('invalid');
      isValid = false;
    } else {
      clearError(errorEl);
      el.classList.remove('invalid');
      el.classList.add('valid');
    }
  });

  // Contact No — 11 digits
  const contactEl  = document.getElementById('contactNo');
  const contactErr = document.getElementById('err-contactNo');
  if (contactEl.value.trim() && !/^\d{11}$/.test(contactEl.value.trim())) {
    showError(contactErr, 'Contact number must be exactly 11 digits.');
    contactEl.classList.add('invalid');
    isValid = false;
  }

  // Emergency contact number — 11 digits
  const ecNumEl  = document.getElementById('emergencyContactNumber');
  const ecNumErr = document.getElementById('err-emergencyContactNumber');
  if (ecNumEl.value.trim() && !/^\d{11}$/.test(ecNumEl.value.trim())) {
    showError(ecNumErr, 'Contact number must be exactly 11 digits.');
    ecNumEl.classList.add('invalid');
    isValid = false;
  }

  // ID Photo — required
  const idPhotoInput = document.getElementById('idPhoto');
  const idPhotoErr   = document.getElementById('err-idPhoto');
  if (!idPhotoInput.files || idPhotoInput.files.length === 0) {
    showError(idPhotoErr, 'ID photo is required.');
    isValid = false;
  }

  // E-Signature — required
  const eSigInput = document.getElementById('eSignature');
  const eSigErr   = document.getElementById('err-eSignature');
  if (!eSigInput.files || eSigInput.files.length === 0) {
    showError(eSigErr, 'E-Signature is required.');
    isValid = false;
  }

  return isValid;
}

// ── Live validation listeners ────────────────────────────────
ALL_TEXT_FIELD_IDS.forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener('blur', () => {
    if (!el.value.trim()) return;
    const errorEl = document.getElementById('err-' + id);
    clearError(errorEl);
    el.classList.remove('invalid');
    el.classList.add('valid');

    if (id === 'contactNo' && !/^\d{11}$/.test(el.value.trim())) {
      showError(errorEl, 'Contact number must be exactly 11 digits.');
      el.classList.add('invalid');
      el.classList.remove('valid');
    }
    if (id === 'emergencyContactNumber' && !/^\d{11}$/.test(el.value.trim())) {
      showError(errorEl, 'Contact number must be exactly 11 digits.');
      el.classList.add('invalid');
      el.classList.remove('valid');
    }
  });

  el.addEventListener('input', () => {
    if (el.value.trim()) {
      const errorEl = document.getElementById('err-' + id);
      clearError(errorEl);
      el.classList.remove('invalid');
    }
  });
});

// ── File to Base64 ───────────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Generate reference number on client side ─────────────────
function generateReferenceNumber() {
  const now    = new Date();
  const year   = now.getFullYear();
  const month  = String(now.getMonth() + 1).padStart(2, '0');
  const day    = String(now.getDate()).padStart(2, '0');
  const rand   = String(Math.floor(Math.random() * 9000) + 1000); // 4-digit random
  return `DEPEDID-${year}${month}${day}-${rand}`;
}

// ── Build FormData payload ───────────────────────────────────
async function buildPayload() {
  const formData = new FormData();

  // All text / select fields
  const textFields = [
    'lastName','firstName','middleName','dateOfBirth','bloodType',
    'address','contactNo','position','employeeNumber','nameOfSchool',
    'schoolAddress','region','schoolsDivisionOf','tin','gsisBpNo',
    'pagIbigNo','philHealthNo','emergencyContactName',
    'emergencyContactAddress','emergencyContactNumber',
    'nameOfSchoolHead','schoolHeadPosition',
  ];

  textFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) formData.append(id, el.value.trim());
  });

  // File fields — append raw File objects
  const fileFields = [
    { id: 'idPhoto',        name: 'idPhoto' },
    { id: 'eSignature',     name: 'eSignature' },
    { id: 'supportingDoc1', name: 'supportingDoc1' },
    { id: 'supportingDoc2', name: 'supportingDoc2' },
  ];

  for (const { id, name } of fileFields) {
    const input = document.getElementById(id);
    if (input && input.files && input.files[0]) {
      formData.append(name, input.files[0]);
    }
  }

  return formData;
}

// ── Form submit ──────────────────────────────────────────────
form.addEventListener('submit', async function (e) {
  e.preventDefault();
  hideElement(submitError);

  if (!validateForm()) {
    const firstInvalid = form.querySelector('.invalid');
    if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  setLoading(true);

  try {
    const referenceNumber = generateReferenceNumber();
    const formData        = await buildPayload();

    // Add reference number and timestamp to the payload
    formData.append('referenceNumber', referenceNumber);
    formData.append('timestamp', new Date().toISOString());

    // Send to Apps Script using no-cors (Apps Script doesn't support CORS
    // from external origins). We generate the reference number client-side
    // and show confirmation immediately; Apps Script saves the row silently.
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: formData,
      mode: 'no-cors',
    }).catch(() => {
      // Silently ignore — no-cors fetch always resolves with opaque response
    });

    // Show confirmation immediately
    refNumberEl.textContent = referenceNumber;
    form.classList.add('hidden');
    successScreen.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (err) {
    showSubmitError('Unable to submit. Please check your connection and try again.');
  } finally {
    setLoading(false);
  }
});

// ── Reset form ───────────────────────────────────────────────
function resetForm() {
  form.reset();
  form.classList.remove('hidden');
  successScreen.classList.add('hidden');

  form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  form.querySelectorAll('input, select').forEach(el => el.classList.remove('valid', 'invalid'));

  removeFile('idPhoto',        'photo-preview-wrap', 'upload-area-photo');
  removeFile('eSignature',     'esig-preview-wrap',  'upload-area-esig');
  removeFile('supportingDoc1', 'doc1-name-wrap',     'upload-area-doc1');
  removeFile('supportingDoc2', 'doc2-name-wrap',     'upload-area-doc2');

  hideElement(submitError);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── UI helpers ───────────────────────────────────────────────
function setLoading(loading) {
  submitBtn.disabled     = loading;
  btnLabel.textContent   = loading ? 'Submitting…' : 'Submit Order';
  btnSpinner.classList.toggle('hidden', !loading);
}

function showError(el, message)  { if (el) el.textContent = message; }
function clearError(el)          { if (el) el.textContent = ''; }
function hideElement(el)         { if (el) el.classList.add('hidden'); }

function showSubmitError(message) {
  submitError.textContent = message;
  submitError.classList.remove('hidden');
  submitError.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
