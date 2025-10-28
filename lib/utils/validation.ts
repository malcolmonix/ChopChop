export interface ValidationRule {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  validate?: (value: any) => boolean | string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export class FormValidator {
  static validateField(value: any, rules: ValidationRule): string | null {
    // Required validation
    if (rules.required) {
      const isEmpty = value === undefined || value === null || value === '' || 
                     (Array.isArray(value) && value.length === 0);
      if (isEmpty) {
        return typeof rules.required === 'string'
          ? rules.required
          : 'This field is required';
      }
    }

    // Skip further validation if value is empty and not required
    if (!value && !rules.required) {
      return null;
    }

    // Min length validation
    if (rules.minLength && String(value).length < rules.minLength.value) {
      return rules.minLength.message;
    }

    // Max length validation
    if (rules.maxLength && String(value).length > rules.maxLength.value) {
      return rules.maxLength.message;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.value.test(String(value))) {
      return rules.pattern.message;
    }

    // Custom validation
    if (rules.validate) {
      const result = rules.validate(value);
      if (result !== true) {
        return typeof result === 'string' ? result : 'Validation failed';
      }
    }

    return null;
  }

  static validateForm(
    formData: Record<string, any>,
    rules: Record<string, ValidationRule>
  ): ValidationErrors {
    const errors: ValidationErrors = {};

    Object.keys(rules).forEach((fieldName) => {
      const error = this.validateField(formData[fieldName], rules[fieldName]);
      if (error) {
        errors[fieldName] = error;
      }
    });

    return errors;
  }

  static isValid(errors: ValidationErrors): boolean {
    return Object.keys(errors).length === 0;
  }
}

// Common validation rules
export const commonValidations = {
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address',
    },
  },
  password: {
    required: 'Password is required',
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters',
    },
  },
  phone: {
    required: 'Phone number is required',
    pattern: {
      value: /^[0-9]{10,15}$/,
      message: 'Invalid phone number',
    },
  },
  name: {
    required: 'Name is required',
    minLength: {
      value: 2,
      message: 'Name must be at least 2 characters',
    },
    maxLength: {
      value: 50,
      message: 'Name must not exceed 50 characters',
    },
  },
  address: {
    required: 'Address is required',
    minLength: {
      value: 10,
      message: 'Address must be at least 10 characters',
    },
  },
};

// React hook for form validation
import { useState, useCallback } from 'react';

export function useFormValidation(
  initialValues: Record<string, any>,
  validationRules: Record<string, ValidationRule>
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback((name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    
    // Validate on change if field was touched
    if (touched[name] && validationRules[name]) {
      const error = FormValidator.validateField(value, validationRules[name]);
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[name] = error;
        } else {
          delete newErrors[name];
        }
        return newErrors;
      });
    }
  }, [validationRules, touched]);

  const handleBlur = useCallback((name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    if (validationRules[name]) {
      const error = FormValidator.validateField(values[name], validationRules[name]);
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[name] = error;
        } else {
          delete newErrors[name];
        }
        return newErrors;
      });
    }
  }, [validationRules, values]);

  const validateAll = useCallback(() => {
    const newErrors = FormValidator.validateForm(values, validationRules);
    setErrors(newErrors);
    
    // Mark all fields as touched
    const allTouched = Object.keys(validationRules).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);
    
    return FormValidator.isValid(newErrors);
  }, [values, validationRules]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    isValid: FormValidator.isValid(errors),
  };
}
