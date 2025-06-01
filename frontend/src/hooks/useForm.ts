import { useState, useCallback } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Record<string, string>;
  onSubmit?: (values: T) => void | Promise<void>;
}

interface UseFormReturn<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  setValue: (name: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (name: keyof T, error: string) => void;
  setErrors: (errors: Record<string, string>) => void;
  setTouched: (name: keyof T, touched: boolean) => void;
  handleChange: (name: keyof T) => (value: any) => void;
  handleBlur: (name: keyof T) => () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
  resetField: (name: keyof T) => void;
}

export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const { initialValues, validate, onSubmit } = options;

  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<Record<string, string>>({});
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = Object.keys(errors).length === 0;

  const setValue = useCallback((name: keyof T, value: any) => {
    setValuesState(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when value changes
    if (errors[name as string]) {
      setErrorsState(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as string];
        return newErrors;
      });
    }
  }, [errors]);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({
      ...prev,
      ...newValues,
    }));
  }, []);

  const setError = useCallback((name: keyof T, error: string) => {
    setErrorsState(prev => ({
      ...prev,
      [name as string]: error,
    }));
  }, []);

  const setErrors = useCallback((newErrors: Record<string, string>) => {
    setErrorsState(newErrors);
  }, []);

  const setTouched = useCallback((name: keyof T, isTouched: boolean) => {
    setTouchedState(prev => ({
      ...prev,
      [name as string]: isTouched,
    }));
  }, []);

  const handleChange = useCallback((name: keyof T) => {
    return (value: any) => {
      setValue(name, value);
    };
  }, [setValue]);

  const handleBlur = useCallback((name: keyof T) => {
    return () => {
      setTouched(name, true);
      
      // Validate field on blur if validate function is provided
      if (validate) {
        const fieldErrors = validate(values);
        if (fieldErrors[name as string]) {
          setError(name, fieldErrors[name as string]);
        }
      }
    };
  }, [values, validate, setTouched, setError]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setIsSubmitting(true);

    try {
      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setTouchedState(allTouched);

      // Validate all fields
      if (validate) {
        const validationErrors = validate(values);
        setErrorsState(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
          setIsSubmitting(false);
          return;
        }
      }

      // Submit form
      if (onSubmit) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrorsState({});
    setTouchedState({});
    setIsSubmitting(false);
  }, [initialValues]);

  const resetField = useCallback((name: keyof T) => {
    setValue(name, initialValues[name]);
    setTouched(name, false);
    
    // Clear error for this field
    setErrorsState(prev => {
      const newErrors = { ...prev };
      delete newErrors[name as string];
      return newErrors;
    });
  }, [initialValues, setValue, setTouched]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setValues,
    setError,
    setErrors,
    setTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    resetField,
  };
}

// Hook for field-level validation
export function useFieldValidation(
  value: any,
  validators: Array<(value: any) => string | undefined>
) {
  const [error, setError] = useState<string>('');

  const validate = useCallback(() => {
    for (const validator of validators) {
      const result = validator(value);
      if (result) {
        setError(result);
        return false;
      }
    }
    setError('');
    return true;
  }, [value, validators]);

  return { error, validate, isValid: !error };
} 