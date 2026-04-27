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
          // Add a small delay to prevent rapid-fire anonymous sign-ins
          await new Promise(resolve => setTimeout(resolve, 500));
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

    // Safety timeout: if loading takes more than 5 seconds, force it to false
    // and set a timeout error if we still don't have a user.
    const timeout = setTimeout(() => {
      setLoading(prev => {
        if (prev && !user) {
          console.warn("Auth loading timed out after 5s");
          setError(new Error("Cellar connection is taking longer than expected. Please check your signal."));
        }
        return false;
      });
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
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
