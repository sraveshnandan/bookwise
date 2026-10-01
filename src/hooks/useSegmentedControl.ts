import { useState, useCallback } from 'react';

export function useSegmentedControl<T extends string>(
  options: T[],
  initialValue: T
) {
  const [value, setValue] = useState<T>(initialValue);

  const select = useCallback((option: T) => {
    setValue(option);
  }, []);

  return [value, select] as const;
}