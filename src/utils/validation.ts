export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validate<T>(value: T, rules: ValidationRule<T>[]): ValidationResult {
  const errors: string[] = [];
  
  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(rule.message);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export const required = <T>(message = 'This field is required'): ValidationRule<T | undefined | null> => ({
  validate: (value) => value !== undefined && value !== null && value !== '',
  message,
});

export const minLength = (min: number, message?: string): ValidationRule<string> => ({
  validate: (value) => value.length >= min,
  message: message || `Must be at least ${min} characters`,
});

export const maxLength = (max: number, message?: string): ValidationRule<string> => ({
  validate: (value) => value.length <= max,
  message: message || `Must be no more than ${max} characters`,
});

export const pattern = (regex: RegExp, message: string): ValidationRule<string> => ({
  validate: (value) => regex.test(value),
  message,
});

export const email = (message = 'Invalid email address'): ValidationRule<string> => ({
  validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  message,
});

export const url = (message = 'Invalid URL'): ValidationRule<string> => ({
  validate: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  message,
});

export const numeric = (message = 'Must be a number'): ValidationRule<string> => ({
  validate: (value) => !isNaN(Number(value)),
  message,
});

export const integer = (message = 'Must be an integer'): ValidationRule<string> => ({
  validate: (value) => Number.isInteger(Number(value)),
  message,
});

export const min = (min: number, message?: string): ValidationRule<number> => ({
  validate: (value) => value >= min,
  message: message || `Must be at least ${min}`,
});

export const max = (max: number, message?: string): ValidationRule<number> => ({
  validate: (value) => value <= max,
  message: message || `Must be no more than ${max}`,
});

export const range = (min: number, max: number, message?: string): ValidationRule<number> => ({
  validate: (value) => value >= min && value <= max,
  message: message || `Must be between ${min} and ${max}`,
});

export const oneOf = <T>(values: T[], message?: string): ValidationRule<T> => ({
  validate: (value) => values.includes(value),
  message: message || `Must be one of: ${values.join(', ')}`,
});

export const match = (field: string, message?: string): ValidationRule<string> => ({
  validate: (value, allValues) => value === allValues[field],
  message: message || `Must match ${field}`,
});

export const custom = <T>(validator: (value: T, allValues?: any) => boolean, message: string): ValidationRule<T> => ({
  validate: (value, allValues) => validator(value, allValues),
  message,
});

export function createValidator<T extends Record<string, any>>(
  schema: Record<keyof T, ValidationRule<any>[]>
) {
  return (values: T): ValidationResult => {
    const allErrors: string[] = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const result = validate(values[field], rules);
      if (!result.isValid) {
        allErrors.push(...result.errors.map((e) => `${field}: ${e}`));
      }
    }
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  };
}

export const loginSchema = {
  email: [required(), email()],
  password: [required(), minLength(8)],
};

export const registerSchema = {
  name: [required(), minLength(2), maxLength(50)],
  email: [required(), email()],
  password: [required(), minLength(8), pattern(/[A-Z]/, 'Must contain uppercase'), pattern(/[a-z]/, 'Must contain lowercase'), pattern(/[0-9]/, 'Must contain number')],
  confirmPassword: [required(), match('password', 'Passwords must match')],
};

export const passwordResetSchema = {
  email: [required(), email()],
};

export const passwordChangeSchema = {
  currentPassword: [required()],
  newPassword: [required(), minLength(8), pattern(/[A-Z]/, 'Must contain uppercase'), pattern(/[a-z]/, 'Must contain lowercase'), pattern(/[0-9]/, 'Must contain number')],
  confirmPassword: [required(), match('newPassword', 'Passwords must match')],
};

export const profileSchema = {
  name: [required(), minLength(2), maxLength(50)],
  email: [required(), email()],
};

export type ValidationSchema<T> = Record<keyof T, ValidationRule<any>[]>;