import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';
import { useRouter, useSegments, useRootNavigation } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Define the shape of our auth context
type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

// Create a provider component that will provide auth state to the app
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();
  const rootNavigation = useRootNavigation();

  // Check if the user is authenticated and redirect them appropriately
  useEffect(() => {
    if (loading) return; // Don't do anything while still loading
    
    const inAuthGroup = segments[0] === 'auth';
    
    if (!session && !inAuthGroup) {
      // If user is not authenticated and not on auth screen, redirect to auth
      router.replace('/auth');
    } else if (session && inAuthGroup) {
      // If user is authenticated but on auth screen, redirect to home
      router.replace('/');
    }
  }, [session, segments, loading, router]);

  // Set up auth state listener
  useEffect(() => {
    // Get current session
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
        // Hide the splash screen once we've checked authentication
        SplashScreen.hideAsync().catch(console.error);
      }
    };
    
    fetchSession();
    
    // Set up a subscription to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);
      setLoading(false);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/auth');
  };

  const value = {
    session,
    user,
    loading,
    signOut,
  };

  // Make sure we don't try to render routes until navigation is ready
  // and authentication is checked
  if (loading && !rootNavigation?.isReady) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to access auth context
export const useAuth = () => useContext(AuthContext);