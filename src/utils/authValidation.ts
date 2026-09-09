/**
 * Client-side Authentication Validation Middleware & Helpers
 * Ensures username, email, full name, and password conform to required rules
 * BEFORE sending any HTTP requests to the backend, completely eliminating
 * redundant 400 validation errors and conserving registration rate-limit attempts.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  firstError: string | null;
}

/**
 * Validate username: min 2, max 30, only alphanumeric and underscores
 */
export function validateUsername(username: string): string | null {
  const trimmed = username ? username.trim() : "";
  if (!trimmed) {
    return "Tên đăng nhập không được để trống.";
  }
  if (trimmed.length < 2) {
    return "Tên đăng nhập phải có tối thiểu 2 ký tự.";
  }
  if (trimmed.length > 30) {
    return "Tên đăng nhập không được vượt quá 30 ký tự.";
  }
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return "Tên đăng nhập chỉ được chứa chữ cái, chữ số và dấu gạch dưới (_).";
  }
  return null;
}

/**
 * Validate email format with standard RFC-compliant regex
 */
export function validateEmail(email: string): string | null {
  const trimmed = email ? email.trim() : "";
  if (!trimmed) {
    return "Địa chỉ email không được để trống.";
  }
  // Standard RFC 5322 regex for web forms
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return "Địa chỉ email không đúng định dạng (ví dụ: name@example.com).";
  }
  return null;
}

/**
 * Validate full name: min 2, max 100 characters
 */
export function validateFullName(name: string): string | null {
  const trimmed = name ? name.trim() : "";
  if (!trimmed) {
    return "Họ và tên không được để trống.";
  }
  if (trimmed.length < 2) {
    return "Họ và tên phải có tối thiểu 2 ký tự.";
  }
  if (trimmed.length > 100) {
    return "Họ và tên không được vượt quá 100 ký tự.";
  }
  return null;
}

/**
 * Validate entire registration payload before dispatch
 */
export function validateRegistrationPayload(data: {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  const nameError = validateFullName(data.name || "");
  if (nameError) errors.name = nameError;

  const usernameError = validateUsername(data.username || "");
  if (usernameError) errors.username = usernameError;

  const emailError = validateEmail(data.email || "");
  if (emailError) errors.email = emailError;

  if (data.password !== undefined) {
    if (!data.password) {
      errors.password = "Mật khẩu không được để trống.";
    } else if (data.password.length < 8) {
      errors.password = "Mật khẩu phải có tối thiểu 8 ký tự.";
    }
  }

  const keys = Object.keys(errors);
  return {
    isValid: keys.length === 0,
    errors,
    firstError: keys.length > 0 ? errors[keys[0]] : null,
  };
}
