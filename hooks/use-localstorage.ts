import { getLocalStorage, setLocalStorage } from '@/lib/utils';
import React from 'react';

/**
 * React hook to persist state in localStorage
 */
export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
): [T, (val: T) => void] {
  const [state, setState] = React.useState<T>(() =>
    getLocalStorage(key, defaultValue),
  );

  const setAndStore = (val: T) => {
    setState(val);
    setLocalStorage(key, val);
  };

  return [state, setAndStore];
}
