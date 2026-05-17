import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { authApi } from '../api/auth';
import { profileApi } from '../api/profiles';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await authApi.getSession();
        setSession(initialSession);
        const currentUser = initialSession?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          try {
            const { data } = await profileApi.getProfile(currentUser.id);
            if (data) setProfile(data);
          } catch (e) {
            console.error('Error fetching profile in auth context', e);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = authApi.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      const currentUser = newSession?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const { data } = await profileApi.getProfile(currentUser.id);
          if (data) setProfile(data);
        } catch (e) {
          console.error('Error fetching profile in auth change', e);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await authApi.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session: refreshedSession } } = await authApi.getSession();
      setSession(refreshedSession);
      const currentUser = refreshedSession?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const { data } = await profileApi.getProfile(currentUser.id);
          if (data) setProfile(data);
        } catch (e) {
          console.error('Error refreshing profile in auth context', e);
        }
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
