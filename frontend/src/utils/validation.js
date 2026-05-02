const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  return null;
}

/** Phone: required; count only digits; max 10 (matches server). */
export function validatePhone(phone) {
  if (!phone || !String(phone).trim()) return 'Phone is required';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 0) return 'Enter a valid phone number';
  if (digits.length > 15) return 'Phone must have at most 15 digits';
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
