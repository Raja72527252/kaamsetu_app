import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { storage } from '../utils/storage';
import { AppState, Language, UserType } from '../types';
import { STORAGE_KEYS } from '../constants';
import { setLanguage } from '../i18n';

type Action =
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_PHONE'; payload: string }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_USER_TYPE'; payload: UserType }
  | { type: 'SET_ONBOARDING_DONE'; payload: boolean }
  | { type: 'SET_PROFILE'; payload: AppState['userProfile'] }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_STATE'; payload: Partial<AppState> };

const initialState: AppState = {
  language: 'hi',
  phoneNumber: null,
  isAuthenticated: false,
  userType: null,
  onboardingCompleted: false,
  userProfile: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LANGUAGE': return { ...state, language: action.payload };
    case 'SET_PHONE': return { ...state, phoneNumber: action.payload };
    case 'SET_AUTHENTICATED': return { ...state, isAuthenticated: action.payload };
    case 'SET_USER_TYPE': return { ...state, userType: action.payload };
    case 'SET_ONBOARDING_DONE': return { ...state, onboardingCompleted: action.payload };
    case 'SET_PROFILE': return { ...state, userProfile: action.payload };
    case 'LOGOUT': return { ...initialState, language: state.language };
    case 'RESTORE_STATE': return { ...state, ...action.payload };
    default: return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  setLanguage: (lang: Language) => Promise<void>;
  login: (phone: string) => Promise<void>;
  setUserType: (type: UserType) => Promise<void>;
  setOnboardingDone: () => Promise<void>;
  updateProfile: (profile: AppState['userProfile']) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const [lang, phone, userType, onboarding, profile] = await Promise.all([
        storage.getItem(STORAGE_KEYS.LANGUAGE),
        storage.getItem(STORAGE_KEYS.PHONE_NUMBER),
        storage.getItem(STORAGE_KEYS.USER_TYPE),
        storage.getItem(STORAGE_KEYS.ONBOARDING_DONE),
        storage.getItem(STORAGE_KEYS.USER_PROFILE),
      ]);
      const restored: Partial<AppState> = {};
      if (lang) { restored.language = lang as Language; setLanguage(lang as Language); }
      if (phone) { restored.phoneNumber = phone; restored.isAuthenticated = true; }
      if (userType) restored.userType = userType as UserType;
      if (onboarding === 'true') restored.onboardingCompleted = true;
      if (profile) { try { restored.userProfile = JSON.parse(profile); } catch {} }
      dispatch({ type: 'RESTORE_STATE', payload: restored });
    } catch (e) {
      console.warn('Session restore error:', e);
    } finally {
      setIsLoading(false);
    }
  }

  const contextSetLanguage = async (lang: Language) => {
    setLanguage(lang);
    dispatch({ type: 'SET_LANGUAGE', payload: lang });
    await storage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  };

  const login = async (phone: string) => {
    dispatch({ type: 'SET_PHONE', payload: phone });
    dispatch({ type: 'SET_AUTHENTICATED', payload: true });
    await storage.setItem(STORAGE_KEYS.PHONE_NUMBER, phone);
  };

  const setUserTypeCtx = async (type: UserType) => {
    dispatch({ type: 'SET_USER_TYPE', payload: type });
    await storage.setItem(STORAGE_KEYS.USER_TYPE, type);
  };

  const setOnboardingDone = async () => {
    dispatch({ type: 'SET_ONBOARDING_DONE', payload: true });
    await storage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
  };

  const updateProfile = async (profile: AppState['userProfile']) => {
    dispatch({ type: 'SET_PROFILE', payload: profile });
    if (profile) {
      await storage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    }
  };

  const logout = async () => {
    await Promise.all([
      storage.removeItem(STORAGE_KEYS.PHONE_NUMBER),
      storage.removeItem(STORAGE_KEYS.USER_TYPE),
      storage.removeItem(STORAGE_KEYS.ONBOARDING_DONE),
      storage.removeItem(STORAGE_KEYS.USER_PROFILE),
    ]);
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AppContext.Provider value={{
      state, dispatch,
      setLanguage: contextSetLanguage,
      login, setUserType: setUserTypeCtx,
      setOnboardingDone, updateProfile, logout,
      isLoading,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
