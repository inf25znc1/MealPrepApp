import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
  type Dispatch,
} from 'react';
import { STORAGE_KEY } from '../data/constants';
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as AppState;
      if (parsed && Array.isArray(parsed.people)) {
        dispatch({ type: 'HYDRATE', payload: parsed });
      }
    } catch {
      // invalid JSON — keep defaults
    }
  }, []);

  useDebouncedStorage(STORAGE_KEY, state);

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
