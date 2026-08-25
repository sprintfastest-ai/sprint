// Single source of truth for password-strength criteria, matching the
// backend's rules exactly (backend/src/middleware/validate.ts's
// passwordField). Both RegisterScreen and ResetPasswordScreen import this
// rather than each re-implementing (and potentially drifting from) the
// same three checks.

export interface PasswordCriterion {
  key: 'length' | 'uppercase' | 'number';
  label: string;
  met: boolean;
}

export function getPasswordCriteria(password: string): PasswordCriterion[] {
  return [
    { key: 'length', label: 'At least 8 characters', met: password.length >= 8 },
    { key: 'uppercase', label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { key: 'number', label: 'One number', met: /[0-9]/.test(password) },
  ];
}

export function isPasswordStrong(password: string): boolean {
  return getPasswordCriteria(password).every((c) => c.met);
}
