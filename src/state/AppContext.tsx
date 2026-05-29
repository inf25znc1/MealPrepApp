import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  type ReactNode,
  type Dispatch,
} from 'react';
import { STORAGE_KEY } from '../data/constants';
import { migrateAppState } from '../domain/migrate';
import type { AppState } from '../domain/types';
import { reducer, initialState, type Action } from './reducer';
import { useDebouncedStorage } from './useLocalStorage';

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        if (parsed && Array.isArray(parsed.people)) {
          dispatch({
            type: 'HYDRATE',
            payload: migrateAppState(parsed),
          });
        }
      }
    } catch {
      // invalid JSON — keep defaults
    } finally {
      setHydrated(true);
    }
  }, []);

  // Wait until hydrate finishes so defaults don't overwrite saved settings on first open.
  useDebouncedStorage(STORAGE_KEY, hydrated ? state : null);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}
