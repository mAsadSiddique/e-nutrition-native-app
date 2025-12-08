/**
 * Validation utility functions for form inputs
 * All validations return error messages or null
 */

export interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export interface PasswordValidationResult {
  rules: PasswordValidation;
  isValid: boolean;
}

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns Error message string or null if valid
 */
export const validateEmail = (email: string): string | null => {
  if (!email || !email.trim()) {
    return 'Please enter an email address';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

/**
 * Validates username
 * @param username - Username string to validate
 * @returns Error message string or null if valid
 */
export const validateUsername = (username: string): string | null => {
  if (!username || !username.trim()) {
    return 'Please enter a username';
  }
  
  if (username.trim().length < 3) {
    return 'Username must be at least 3 characters';
  }
  
  return null;
};

/**
 * Validates password against rules
 * @param password - Password string to validate
 * @returns PasswordValidationResult with rules breakdown and overall validity
 */
export const validatePasswordRules = (password: string): PasswordValidationResult => {
  const rules: PasswordValidation = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  
  return {
    rules,
    isValid: Object.values(rules).every(Boolean),
  };
};

/**
 * Validates password field
 * @param password - Password string to validate
 * @returns Error message string or null if valid
 */
export const validatePassword = (password: string): string | null => {
  if (!password || !password.trim()) {
    return 'Please enter a password';
  }
  
  const validation = validatePasswordRules(password);
  if (!validation.isValid) {
    return 'Password must meet all requirements';
  }
  
  return null;
};

/**
 * Validates confirm password matches password
 * @param password - Original password
 * @param confirmPassword - Confirmation password
 * @returns Error message string or null if valid
 */
export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): string | null => {
  if (!confirmPassword || !confirmPassword.trim()) {
    return 'Please confirm your password';
  }
  
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return null;
};

/**
 * Validates phone number (basic validation)
 * @param phoneNumber - Phone number string to validate
 * @returns Error message string or null if valid
 */
export const validatePhoneNumber = (phoneNumber: string): string | null => {
  if (!phoneNumber || !phoneNumber.trim()) {
    return 'Please enter your phone number';
  }
  
  // Basic validation - at least 10 digits
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  if (digitsOnly.length < 10) {
    return 'Please enter a valid phone number';
  }
  
  return null;
};

/**
 * Validates verification code
 * @param code - Verification code string
 * @param length - Expected length of code (default: 6)
 * @returns Error message string or null if valid
 */
export const validateVerificationCode = (code: string, length: number = 6): string | null => {
  if (!code || code.length !== length) {
    return `Please enter the complete ${length}-digit code`;
  }
  
  return null;
};

/**
 * Validates name field
 * @param name - Name string to validate
 * @returns Error message string or null if valid
 */
export const validateName = (name: string): string | null => {
  if (!name || !name.trim()) {
    return 'Please enter your name';
  }
  
  return null;
};

