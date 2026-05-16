import { supabase } from '../lib/supabase';
import { AuthResponse, SignInWithPasswordCredentials, SignUpWithPasswordCredentials } from '@supabase/supabase-js';

export const authApi = {
  /**
   * Sign in with email and password
   */
  signIn: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    return await supabase.auth.signInWithPassword(credentials);
  },

  /**
   * Sign up with email and password
   */
  signUp: async (credentials: { email: string; password: string; options?: any }): Promise<AuthResponse> => {
    return await supabase.auth.signUp(credentials);
  },

  /**
   * Sign out
   */
  signOut: async () => {
    return await supabase.auth.signOut();
  },

  /**
   * Reset password
   */
  resetPassword: async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'eliteestates://reset-password',
    });
  },

  /**
   * Get current session
   */
  getSession: async () => {
    return await supabase.auth.getSession();
  },

  /**
   * Get current user
   */
  getUser: async () => {
    return await supabase.auth.getUser();
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};
