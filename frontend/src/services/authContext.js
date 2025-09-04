import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase, signIn, signUp, signOut, getCurrentUser } from '../lib/supabaseClient';

console.log('🔗 Using Supabase for authentication');

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId;
    
    console.log('🔄 AuthProvider initializing...');
    
    // Check initial session immediately with timeout
    const initializeAuth = async () => {
      try {
        console.log('🔍 Checking for existing session...');
        
        // Create a timeout promise that resolves after 10 seconds (extended from 3s)
        console.log('🕒 Starting auth check with 10s timeout...');
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            console.error('⏰ Authentication check timed out after 10 seconds');
            reject(new Error('Authentication check timed out'));
          }, 10000); // Extended to 10 second timeout for slower connections
        });
        
        // Race between the actual auth check and the timeout
        console.log('🚀 Starting session check...');
        const sessionStartTime = Date.now();
        const sessionPromise = supabase.auth.getSession();
        const { data: { session }, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]);
        const sessionEndTime = Date.now();
        console.log(`⚡ Session check completed in ${sessionEndTime - sessionStartTime}ms`);
        
        // Clear the timeout since we got a response
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
        } else if (session?.user) {
          console.log('✅ Found existing session for:', session.user.email);
          if (mounted) {
            setUser(session.user);
            setIsAuthenticated(true);
            await fetchUserProfile(session.user.id);
          }
        } else {
          console.log('ℹ️ No existing session found');
        }
      } catch (error) {
        console.error('💥 Auth initialization error:', error);
        if (error.message.includes('timed out')) {
          console.warn('⚠️ Authentication check timed out after 3 seconds, proceeding with unauthenticated state');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email || 'no user');
      
      if (!mounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in:', session.user.email);
        setUser(session.user);
        setIsAuthenticated(true);
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT' || !session?.user) {
        console.log('👋 User signed out or session expired');
        setUser(null);
        setIsAuthenticated(false);
        setSubscription(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('🔄 Token refreshed for:', session.user.email);
        setUser(session.user);
        setIsAuthenticated(true);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      authSubscription?.unsubscribe();
    };
  }, []);


  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const login = async (email, password, rememberMe = true) => {
    try {
      console.log('🔑 Attempting login for:', email, rememberMe ? '(will remember)' : '(session only)');
      
      const { user, error } = await signIn(email, password);
      
      if (error) {
        console.error('❌ Supabase login error:', error);
        let errorMessage = 'Login failed. Please check your credentials.';
        
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and confirm your account before signing in.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a moment and try again.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
      }
      
      if (user) {
        console.log('✅ Login successful for user:', user.id);
        
        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem('adcopysurge-remember-user', 'true');
          console.log('💾 User will be remembered');
        } else {
          localStorage.setItem('adcopysurge-remember-user', 'false');
          console.log('🔄 Session-only login');
        }
        
        toast.success('Successfully logged in!');
        
        // The onAuthStateChange listener will handle state updates
        return { success: true };
      } else {
        console.warn('⚠️ No user returned from Supabase');
        return { success: false, error: 'Login failed. Please try again.' };
      }
    } catch (error) {
      console.error('💥 Unexpected login error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      const { email, password, full_name, company } = userData;
      const { user, error } = await signUp(email, password, {
        full_name,
        company
      });
      
      if (error) {
        console.error('❌ Supabase registration error:', error);
        let errorMessage = 'Registration failed. Please try again.';
        
        // Provide more specific error messages
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please try signing in instead.';
        } else if (error.message.includes('Password should be')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
      }
      
      // Create user profile
      if (user) {
        console.log('✅ Registration successful for user:', user.id);
        await createUserProfile(user, { full_name, company });
      }
      
      toast.success('Registration successful! Please check your email to verify your account.');
      return { success: true };
    } catch (error) {
      console.error('💥 Unexpected registration error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  };

  const createUserProfile = async (user, userData) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: userData.full_name,
          company: userData.company,
          subscription_tier: 'free',
          monthly_analyses: 0,
          subscription_active: true,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error creating user profile:', error);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const logout = async () => {
    try {
      console.log('👋 Logging out user...');
      
      // Clear remember me preference
      localStorage.removeItem('adcopysurge-remember-user');
      
      await signOut();
      
      // Clear local state immediately
      setUser(null);
      setIsAuthenticated(false);
      setSubscription(null);
      
      console.log('✅ Logout successful');
      toast.success('Successfully logged out!');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    subscription,
    login,
    register,
    logout,
    supabase // Expose supabase client for direct use
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
