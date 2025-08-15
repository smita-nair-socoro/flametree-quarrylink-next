import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { APIClient } from '../api/APIClient';
import { UserWithRelations } from '../types/user';

interface CookieAuthContext {
  user: UserWithRelations | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const CookieAuth = createContext<CookieAuthContext | undefined>(undefined);

export function CookieAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, see if the session cookie is already valid:
  useEffect(() => {
    APIClient.auth
      .validate()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    await APIClient.auth.login(email, password);
    const u = await APIClient.auth.validate();
    setUser(u);
  };

  const logout = async () => {
    await APIClient.auth.logout();
    setUser(null);
  };

  return (
    <CookieAuth.Provider value={{ user, loading, login, logout }}>
      {children}
    </CookieAuth.Provider>
  );
}

export function useCookieAuth() {
  const ctx = useContext(CookieAuth);
  if (!ctx) throw new Error('useCookieAuth must live under CookieAuthProvider');
  return ctx;
}
