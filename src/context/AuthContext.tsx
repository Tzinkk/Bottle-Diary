import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInAnonymously, logout as firebaseLogout } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        try {
          setError(null);
          await signInAnonymously(auth);
        } catch (err: any) {
          console.error("Anonymous sign-in failed:", err);
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      } else {
        setUser(currentUser);
        setError(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await firebaseLogout();
    } catch (err: any) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
