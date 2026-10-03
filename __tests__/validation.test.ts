import { validate, required, minLength, maxLength, pattern, email, url, numeric, min, max, range, oneOf, match, custom, createValidator, loginSchema, registerSchema } from '@/utils/validation';

describe('validation', () => {
  describe('validate', () => {
    it('returns valid for passing rules', () => {
      const result = validate('hello', [
        required(),
        minLength(3),
      ]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns invalid for failing rules', () => {
      const result = validate('hi', [
        required(),
        minLength(3, 'Must be at least 3 chars'),
      ]);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Must be at least 3 chars');
    });

    it('collects multiple errors', () => {
      const result = validate('', [
        required('Required'),
        minLength(5, 'Too short'),
      ]);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe('required', () => {
    it('passes for non-empty values', () => {
      expect(required().validate('hello')).toBe(true);
      expect(required().validate('0')).toBe(true);
      expect(required().validate(0)).toBe(true);
    });

    it('fails for empty values', () => {
      expect(required().validate('')).toBe(false);
      expect(required().validate(null)).toBe(false);
      expect(required().validate(undefined)).toBe(false);
    });

    it('uses custom message', () => {
      const rule = required('Custom message');
      const result = validate('', [rule]);
      expect(result.errors[0]).toBe('Custom message');
    });
  });

  describe('minLength', () => {
    it('passes for sufficient length', () => {
      expect(minLength(3).validate('hello')).toBe(true);
      expect(minLength(3).validate('abc')).toBe(true);
    });

    it('fails for short strings', () => {
      expect(minLength(5).validate('hi')).toBe(false);
    });

    it('uses custom message', () => {
      const rule = minLength(5, 'Custom min length');
      const result = validate('hi', [rule]);
      expect(result.errors[0]).toBe('Custom min length');
    });
  });

  describe('maxLength', () => {
    it('passes for short strings', () => {
      expect(maxLength(10).validate('hello')).toBe(true);
    });

    it('fails for long strings', () => {
      expect(maxLength(3).validate('hello')).toBe(false);
    });
  });

  describe('pattern', () => {
    it('validates against regex', () => {
      const rule = pattern(/^[A-Z]+$/, 'Must be uppercase');
      expect(rule.validate('HELLO')).toBe(true);
      expect(rule.validate('Hello')).toBe(false);
    });
  });

  describe('email', () => {
    it('validates email format', () => {
      expect(email().validate('test@example.com')).toBe(true);
      expect(email().validate('user+tag@domain.org')).toBe(true);
      expect(email().validate('invalid')).toBe(false);
      expect(email().validate('missing@')).toBe(false);
    });
  });

  describe('url', () => {
    it('validates URLs', () => {
      expect(url().validate('https://example.com')).toBe(true);
      expect(url().validate('http://localhost')).toBe(true);
      expect(url().validate('not-a-url')).toBe(false);
    });
  });

  describe('numeric', () => {
    it('validates numeric strings', () => {
      expect(numeric().validate('123')).toBe(true);
      expect(numeric().validate('12.34')).toBe(true);
      expect(numeric().validate('-10')).toBe(true);
      expect(numeric().validate('abc')).toBe(false);
    });
  });

  describe('integer', () => {
    it('validates integers', () => {
      expect(integer().validate('123')).toBe(true);
      expect(integer().validate('12.34')).toBe(false);
      expect(integer().validate('abc')).toBe(false);
    });
  });

  describe('min', () => {
    it('validates minimum value', () => {
      expect(min(0).validate(5)).toBe(true);
      expect(min(10).validate(5)).toBe(false);
    });
  });

  describe('max', () => {
    it('validates maximum value', () => {
      expect(max(10).validate(5)).toBe(true);
      expect(max(10).validate(15)).toBe(false);
    });
  });

  describe('range', () => {
    it('validates range', () => {
      expect(range(0, 10).validate(5)).toBe(true);
      expect(range(0, 10).validate(-1)).toBe(false);
      expect(range(0, 10).validate(11)).toBe(false);
    });
  });

  describe('oneOf', () => {
    it('validates against allowed values', () => {
      const rule = oneOf(['red', 'green', 'blue']);
      expect(rule.validate('red')).toBe(true);
      expect(rule.validate('yellow')).toBe(false);
    });
  });

  describe('match', () => {
    it('validates matching fields', () => {
      const rule = match('password');
      expect(rule.validate('secret', { password: 'secret' })).toBe(true);
      expect(rule.validate('wrong', { password: 'secret' })).toBe(false);
    });
  });

  describe('custom', () => {
    it('validates with custom function', () => {
      const rule = custom((value) => value > 5, 'Must be greater than 5');
      expect(rule.validate(10)).toBe(true);
      expect(rule.validate(3)).toBe(false);
    });

    it('receives all values', () => {
      const rule = custom((value, allValues) => value === allValues.other, 'Must match other');
      expect(rule.validate('same', { other: 'same' })).toBe(true);
      expect(rule.validate('diff', { other: 'same' })).toBe(false);
    });
  });

  describe('createValidator', () => {
    it('creates validator from schema', () => {
      const schema = {
        name: [required(), minLength(2)],
        email: [required(), email()],
        age: [required(), numeric(), min(18)],
      };
      
      const validator = createValidator(schema);
      
      const result = validator({
        name: 'John',
        email: 'john@example.com',
        age: '25',
      });
      
      expect(result.isValid).toBe(true);
    });

    it('collects all errors', () => {
      const schema = {
        name: [required(), minLength(2)],
        email: [required(), email()],
      };
      
      const validator = createValidator(schema);
      
      const result = validator({
        name: 'J',
        email: 'invalid',
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('loginSchema', () => {
    it('validates login form', () => {
      const validator = createValidator(loginSchema);
      
      expect(validator({ email: 'test@example.com', password: 'password123' }).isValid).toBe(true);
      expect(validator({ email: 'invalid', password: 'password123' }).isValid).toBe(false);
      expect(validator({ email: 'test@example.com', password: 'short' }).isValid).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('validates registration form', () => {
      const validator = createValidator(registerSchema);
      
      expect(validator({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      }).isValid).toBe(true);
      
      expect(validator({
        name: 'J',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      }).isValid).toBe(false);
      
      expect(validator({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Different123',
      }).isValid).toBe(false);
    });
  });
});