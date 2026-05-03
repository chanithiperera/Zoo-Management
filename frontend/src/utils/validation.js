const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Keep in sync with `backend/src/validations/feedback.validation.js` FEEDBACK_TYPES. */
export const FEEDBACK_TYPES = [
  'Entry Tickets and Show Booking',
  'Event Booking',
  'Animal Encounter and Photography',
  'Animal Information and Education',
  'Online Store',
  'General',
];

export function validateEmail(email) {
  if (!email || !email.trim()) return 'Email is required';
  if (!EMAIL_RE.test(email.trim())) return 'Enter a valid email';
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

export function validateRequired(value, fieldName) {
  if (!value || !String(value).trim()) return `${fieldName} is required`;
  return null;
}

/** Full name: required, no digits (matches server). */
export function validateFullName(fullName) {
  const req = validateRequired(fullName, 'Full name');
  if (req) return req;
  if (/\d/.test(String(fullName))) return 'Name must not contain numbers';
  return null;
}

/** Phone: required; digits only count; max 15 (matches server). */
export function validatePhone(phone) {
  if (!phone || !String(phone).trim()) return 'Phone is required';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 0) return 'Enter a valid phone number';
  if (digits.length > 15) return 'Phone must contain 1–15 digits';
  return null;
}

export function validateRegisterForm({ fullName, email, phone, password, confirmPassword }) {
  const errors = {};
  const fn = validateFullName(fullName);
  if (fn) errors.fullName = fn;
  const em = validateEmail(email);
  if (em) errors.email = em;
  const ph = validatePhone(phone);
  if (ph) errors.phone = ph;
  const pw = validatePassword(password);
  if (pw) errors.password = pw;
  const cp = validateRequired(confirmPassword, 'Confirm password');
  if (cp) errors.confirmPassword = cp;
  else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
}

/** Profile edit (name, email, phone only). */
export function validateProfileFields({ fullName, email, phone }) {
  const errors = {};
  const fn = validateFullName(fullName);
  if (fn) errors.fullName = fn;
  const em = validateEmail(email);
  if (em) errors.email = em;
  const ph = validatePhone(phone);
  if (ph) errors.phone = ph;
  return errors;
}

export function validateLoginForm({ email, password }) {
  const errors = {};
  const em = validateEmail(email);
  if (em) errors.email = em;
  if (!password) errors.password = 'Password is required';
  return errors;
}

/** Feedback / inquiry forms (aligned with sensible DB limits). */
export const FEEDBACK_SUBJECT_MIN = 3;
export const FEEDBACK_SUBJECT_MAX = 200;
export const FEEDBACK_MESSAGE_MIN = 10;
export const FEEDBACK_MESSAGE_MAX = 8000;

/**
 * @param {{ type: string; subject: string; message: string; allowedTypes?: string[] }} input
 * @returns {Record<string, string>} Field key → error message (empty object if valid).
 */
export function validateTypeSubjectMessage({ type, subject, message, allowedTypes = FEEDBACK_TYPES }) {
  const errors = {};
  const t = String(type ?? '').trim();
  if (!t) errors.type = 'Please select a category.';
  else if (allowedTypes?.length && !allowedTypes.includes(t)) errors.type = 'Invalid category selected.';

  const s = String(subject ?? '').trim();
  if (!s) errors.subject = 'Subject is required.';
  else if (s.length < FEEDBACK_SUBJECT_MIN) {
    errors.subject = `Subject must be at least ${FEEDBACK_SUBJECT_MIN} characters.`;
  } else if (s.length > FEEDBACK_SUBJECT_MAX) {
    errors.subject = `Subject must be no more than ${FEEDBACK_SUBJECT_MAX} characters.`;
  }

  const m = String(message ?? '').trim();
  if (!m) errors.message = 'Message is required.';
  else if (m.length < FEEDBACK_MESSAGE_MIN) {
    errors.message = `Message must be at least ${FEEDBACK_MESSAGE_MIN} characters.`;
  } else if (m.length > FEEDBACK_MESSAGE_MAX) {
    errors.message = `Message must be no more than ${FEEDBACK_MESSAGE_MAX} characters.`;
  }

  return errors;
}

/**
 * @param {{ rating: number; message: string }} input
 * @returns {Record<string, string>}
 */
export function validateReviewFields({ rating, message }) {
  const errors = {};
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) {
    errors.rating = 'Please choose a rating from 1 to 5.';
  }

  const m = String(message ?? '').trim();
  if (!m) errors.message = 'Review text is required.';
  else if (m.length < FEEDBACK_MESSAGE_MIN) {
    errors.message = `Review must be at least ${FEEDBACK_MESSAGE_MIN} characters.`;
  } else if (m.length > FEEDBACK_MESSAGE_MAX) {
    errors.message = `Review must be no more than ${FEEDBACK_MESSAGE_MAX} characters.`;
  }

  return errors;
}

export function hasValidationErrors(errors) {
  return errors && Object.keys(errors).length > 0;
}
