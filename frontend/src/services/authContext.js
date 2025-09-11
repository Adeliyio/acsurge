import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase, signIn, signUp, signOut, getCurrentUser } from '../lib/supabaseClient';
import { runAuthDiagnostics } from '../utils/authDebug';

console.log('🔗 Using Supabase for authentication');

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Network connectivity check utility
const checkNetworkConnectivity = async () => {
  try {
    // Try a simple fetch to a reliable endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('https://httpbin.org/get', {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-cache'
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('⚠️ Network connectivity check failed:', error.message);
    return false;
  }
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
    
    // Check initial session immediately with timeout and fallbacks
    const initializeAuth = async () => {
      // Set overall timeout for auth initialization (prevent infinite loading)
      const overallTimeoutId = setTimeout(() => {
        console.warn('⏰ Auth initialization taking too long, forcing completion...');
        if (mounted) {
          setLoading(false);
        }
      }, 25000); // 25 second overall timeout
      
      try {
        console.log('🔍 Checking for existing session...');
        
        // Clear overall timeout on any successful completion
        const clearOverallTimeout = () => {
          if (overallTimeoutId) {
            clearTimeout(overallTimeoutId);
          }
        };
        
        // Quick network connectivity check
        console.log('🌐 Checking network connectivity...');
        const hasNetwork = await checkNetworkConnectivity();
        if (!hasNetwork) {
          console.warn('⚠️ Poor network connectivity detected - authentication may be slower');
        } else {
          console.log('✅ Network connectivity confirmed');
        }
        
        // Try different approaches in order of preference
        const attempts = [
          // Attempt 1: Try localStorage first (fastest)
          {
            name: 'LocalStorage check',
            timeout: 1000,
            method: () => {
              const storedSession = localStorage.getItem('adcopysurge-supabase-auth-token');
              if (storedSession) {
                try {
                  const parsed = JSON.parse(storedSession);
                  if (parsed.expires_at && new Date(parsed.expires_at * 1000) > new Date()) {
                    return Promise.resolve({ data: { session: parsed }, error: null });
                  }
                } catch (e) {
                  console.warn('⚠️ Failed to parse stored session:', e);
                }
              }
              return Promise.resolve({ data: { session: null }, error: null });
            }
          },
          // Attempt 2: Quick session check with reasonable timeout
          {
            name: 'Quick session check',
            timeout: 8000, // Reduced from 15000ms
            method: () => supabase.auth.getSession()
          },
          // Attempt 3: Direct user check as final fallback
          {
            name: 'Direct user check',
            timeout: 12000, // Reduced from 30000ms
            method: () => supabase.auth.getUser()
          }
        ];
        
        for (const attempt of attempts) {
          try {
            console.log(`🚀 Trying ${attempt.name} (${attempt.timeout}ms timeout)...`);
            const startTime = Date.now();
            
            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => {
              timeoutId = setTimeout(() => {
                console.warn(`⏰ ${attempt.name} timed out after ${attempt.timeout}ms`);
                reject(new Error(`${attempt.name} timed out`));
              }, attempt.timeout);
            });
            
            // Race between the auth check and timeout
            const result = await Promise.race([
              attempt.method(),
              timeoutPromise
            ]);
            
            const endTime = Date.now();
            console.log(`⚡ ${attempt.name} completed in ${endTime - startTime}ms`);
            
            // Clear timeout
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
            
            // Handle the result
            const { data, error } = result;
            const session = data?.session || data?.user ? { user: data.user || data.session?.user } : null;
            
            if (error) {
              console.warn(`⚠️ ${attempt.name} error:`, error);
              continue; // Try next method
            }
            
            if (session?.user) {
              console.log(`✅ Found session via ${attempt.name} for:`, session.user.email);
              if (mounted) {
                setUser(session.user);
                setIsAuthenticated(true);
                setLoading(false); // Ensure loading is set to false
                clearOverallTimeout(); // Clear the overall timeout
                await fetchUserProfile(session.user.id);
              }
              return; // Success, exit the loop
            }
            
            console.log(`ℹ️ ${attempt.name} found no session`);
            break; // No session found, no need to try other methods
            
          } catch (attemptError) {
            console.warn(`⚠️ ${attempt.name} failed:`, attemptError.message);
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
            // Continue to next attempt
          }
        }
        
        console.log('ℹ️ All authentication attempts completed - no valid session found');
      } catch (error) {
        console.error('💥 Auth initialization error:', error);
        if (error.message.includes('timed out')) {
          console.warn('⚠️ All authentication methods timed out, proceeding with unauthenticated state');
          
          // Run diagnostics in development to help debug the issue
          if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Running authentication diagnostics...');
            setTimeout(() => runAuthDiagnostics(), 1000); // Run after a delay to avoid interfering with initialization
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        // Always clear the overall timeout
        if (overallTimeoutId) {
          clearTimeout(overallTimeoutId);
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
