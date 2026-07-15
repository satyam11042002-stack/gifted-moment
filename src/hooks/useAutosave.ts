import { useEffect, useRef, useState } from "react";

export function useAutosave<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void, () => void] {
  const [state, setState] = useState<T>(initial);
  const hydrated = useRef(false);

  // hydrate from localStorage on client only
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState({ ...initial, ...(JSON.parse(raw) as T) });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist on change
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);

  const clear = () => {
    try {
      localStorage.removeItem(key);
    } catch {}
  };

  return [state, setState, clear];
}
