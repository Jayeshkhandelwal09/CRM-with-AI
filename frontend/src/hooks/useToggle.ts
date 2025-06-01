import { useState, useCallback } from 'react';

export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  const setToggle = useCallback((newValue: boolean) => {
    setValue(newValue);
  }, []);

  return [value, toggle, setToggle];
}

// Hook for multiple toggles
export function useMultipleToggle(
  initialValues: Record<string, boolean> = {}
): [
  Record<string, boolean>,
  (key: string) => void,
  (key: string, value: boolean) => void,
  () => void
] {
  const [values, setValues] = useState<Record<string, boolean>>(initialValues);

  const toggle = useCallback((key: string) => {
    setValues(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  const setToggle = useCallback((key: string, value: boolean) => {
    setValues(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const resetAll = useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);

  return [values, toggle, setToggle, resetAll];
} 