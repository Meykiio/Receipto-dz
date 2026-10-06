import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import i18n from '@/i18n';

/**
 * True when the failure was a transport failure rather than a rejected
 * credential. In a local-first app this almost always means Docker is not
 * running, so it is worth naming instead of surfacing a raw Supabase message.
 */
const isBackendUnreachable = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /failed to fetch|networkerror|econnrefused|load failed|fetch failed|network request failed/i.test(
    message,
  );
};

const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

/** Sticky toast: this one must not auto-dismiss before it is read. */
const showBackendUnreachable = () =>
  toast.error(t('auth.backendUnreachable'), {
    description: t('auth.backendUnreachableDesc'),
    duration: Infinity,
  });

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Record<string, unknown>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  
  // Convert Supabase user to our User type
  const formatUser = (supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? "",
      user_metadata: supabaseUser.user_metadata
    };
  };
  
  // Handle user authentication state
  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session?.user) {
          setUser(formatUser(session.user));
        }
      } catch (error: unknown) {
        if (isBackendUnreachable(error)) {
          console.error('Session check failed: database unreachable:', error);
          showBackendUnreachable();
        } else if (error instanceof Error) {
          console.error('Error checking session:', error.message);
          toast.error(t('auth.backendUnreachable'), { description: t('auth.unknownError') });
        } else {
          console.error('Unknown error checking session:', error);
          toast.error(t('auth.backendUnreachable'), { description: t('auth.unknownError') });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(formatUser(session.user));
        // REMOVED TOAST FROM HERE:
        // The toast for successful sign-in is now handled by the signIn function itself.
        // This prevents the toast from showing on every session refresh or initial load.
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        toast.success(t('auth.signedOut'));
      } else if (event === 'USER_UPDATED' && session?.user) {
        setUser(formatUser(session.user));
      }
      
      setIsLoading(false);
    });
    
    return () => {
      subscription.unsubscribe();
    };
    // Intentionally runs once: the auth listener must not re-subscribe when
    // the toast helper identity changes.
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Clean up auth state before signing in
      cleanupAuthState();
      
      // Sign in with email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // setUser(formatUser(data.user)); // onAuthStateChange will handle setting the user
        toast.success(t('auth.signedIn'), {
          description: t('auth.welcomeBack', { email }),
        });
      }
    } catch (error: unknown) {
      if (isBackendUnreachable(error)) {
        console.error('Sign in failed: database unreachable:', error);
        showBackendUnreachable();
      } else if (error instanceof Error) {
        console.error('Sign in error:', error.message);
        const msg = error.message || '';
        let description = t('auth.invalidCredentials');
        if (msg.toLowerCase().includes('email not confirmed')) {
          description = t('auth.emailNotConfirmedDesc');
        }
        toast.error(t('auth.signInFailed'), { description });
      } else {
        console.error('Unknown sign in error:', error);
        toast.error(t('auth.signInFailed'), { description: t('auth.unknownError') });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Clean up auth state before signing up
      cleanupAuthState();
      
      // Sign up with email/password
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            email_confirmed: false
          }
        }
      });
      
      if (error) {
        // Handle specific error cases
        if (error.message.includes('Email not confirmed')) {
          toast.success(t('auth.confirmRequired'), { description: t('auth.confirmRequiredDesc') });
          return; // Don't throw error for this case
        } else if (error.message.includes('User already registered')) {
          toast.error(t('auth.emailRegistered'), { description: t('auth.emailRegisteredDesc') });
          throw error;
        } else {
          throw error;
        }
      }

      if (data.user) {
        // Don't set user here since they need to confirm email first
        toast.success(t('auth.accountCreated'), { description: t('auth.accountCreatedDesc') });
      }
    } catch (error: unknown) {
      if (isBackendUnreachable(error)) {
        console.error('Sign up failed: database unreachable:', error);
        showBackendUnreachable();
      } else if (error instanceof Error) {
        console.error('Sign up error:', error.message);
        toast.error(t('auth.signUpFailed'), { description: t('auth.signUpFailedDesc') });
      } else {
        console.error('Unknown sign up error:', error);
        toast.error(t('auth.signUpFailed'), { description: t('auth.unknownError') });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Clean up auth state
      cleanupAuthState();
      
      setUser(null);
      toast.success(t('auth.signedOut'));
    } catch (error: unknown) {
      if (isBackendUnreachable(error)) {
        console.error('Sign out failed: database unreachable:', error);
        showBackendUnreachable();
      } else if (error instanceof Error) {
        console.error('Sign out error:', error.message);
        toast.error(t('auth.signOutFailed'), { description: t('auth.unknownError') });
      } else {
        console.error('Unknown sign out error:', error);
        toast.error(t('auth.signOutFailed'), { description: t('auth.unknownError') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add updateUserProfile function
  const updateUserProfile = async (data: Record<string, unknown>) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        data
      });
      
      if (error) {
        throw error;
      }
      
      if (user) {
        // Update local user state with new metadata
        setUser({
          ...user,
          user_metadata: {
            ...user.user_metadata,
            ...data
          }
        });
      }
      
      toast.success(t('auth.profileUpdated'));
    } catch (error: unknown) {
      if (isBackendUnreachable(error)) {
        console.error('Profile update failed: database unreachable:', error);
        showBackendUnreachable();
      } else if (error instanceof Error) {
        console.error('Profile update error:', error.message);
        toast.error(t('auth.profileUpdateFailed'), { description: t('auth.unknownError') });
      } else {
        console.error('Unknown profile update error:', error);
        toast.error(t('auth.profileUpdateFailed'), { description: t('auth.unknownError') });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to clean up auth state
  const cleanupAuthState = () => {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
