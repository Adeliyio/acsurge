// Authentication debugging utilities
import { supabase } from '../lib/supabaseClient';

export const runAuthDiagnostics = async () => {
  console.log('🔧 === AUTHENTICATION DIAGNOSTICS ===');
  
  // Check environment variables
  console.log('🔧 Environment Configuration:');
  console.log('- Supabase URL:', process.env.REACT_APP_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('- Supabase Anon Key:', process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.log('- Node Environment:', process.env.NODE_ENV);
  
  // Check network connectivity
  console.log('\n🌐 Network Connectivity:');
  try {
    const startTime = Date.now();
    const response = await fetch('https://httpbin.org/get', { 
      method: 'GET',
      cache: 'no-cache',
      signal: AbortSignal.timeout(5000)
    });
    const endTime = Date.now();
    console.log(`- Basic connectivity: ✅ OK (${endTime - startTime}ms)`);
  } catch (error) {
    console.log('- Basic connectivity: ❌ Failed -', error.message);
  }
  
  // Check Supabase connectivity
  console.log('\n🔗 Supabase Connectivity:');
  try {
    const startTime = Date.now();
    const { data, error } = await supabase.auth.getSession();
    const endTime = Date.now();
    
    if (error) {
      console.log(`- Supabase auth: ❌ Error (${endTime - startTime}ms) -`, error.message);
    } else {
      console.log(`- Supabase auth: ✅ OK (${endTime - startTime}ms)`);
      console.log('- Session status:', data.session ? '✅ Active session' : '🔄 No session');
    }
  } catch (error) {
    console.log('- Supabase auth: ❌ Exception -', error.message);
  }
  
  // Check localStorage
  console.log('\n💾 Local Storage:');
  try {
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('supabase') || key.includes('adcopysurge')
    );
    
    if (authKeys.length === 0) {
      console.log('- Auth tokens: 🔄 None found');
    } else {
      console.log('- Auth tokens found:', authKeys.length);
      authKeys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          const parsed = JSON.parse(value);
          if (parsed.expires_at) {
            const expiresAt = new Date(parsed.expires_at * 1000);
            const isExpired = expiresAt < new Date();
            console.log(`  - ${key}: ${isExpired ? '❌ Expired' : '✅ Valid'} (expires: ${expiresAt.toLocaleString()})`);
          } else {
            console.log(`  - ${key}: 🔄 Non-session data`);
          }
        } catch (e) {
          console.log(`  - ${key}: ❌ Parse error`);
        }
      });
    }
  } catch (error) {
    console.log('- localStorage access: ❌ Failed -', error.message);
  }
  
  // Performance check
  console.log('\n⚡ Performance Tests:');
  const tests = [
    { name: 'getSession', fn: () => supabase.auth.getSession() },
    { name: 'getUser', fn: () => supabase.auth.getUser() }
  ];
  
  for (const test of tests) {
    try {
      const startTime = Date.now();
      await test.fn();
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      let status = '✅ Good';
      if (duration > 5000) status = '❌ Very Slow';
      else if (duration > 2000) status = '⚠️ Slow';
      else if (duration > 1000) status = '🔄 Moderate';
      
      console.log(`- ${test.name}: ${status} (${duration}ms)`);
    } catch (error) {
      console.log(`- ${test.name}: ❌ Failed -`, error.message);
    }
  }
  
  console.log('\n🔧 === END DIAGNOSTICS ===');
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  const recommendations = [];
  
  if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
    recommendations.push('- Check your .env file contains REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
  }
  
  // We could add more dynamic recommendations based on the test results
  
  if (recommendations.length === 0) {
    console.log('- No specific issues detected. If problems persist, check network connectivity and Supabase service status.');
  } else {
    recommendations.forEach(rec => console.log(rec));
  }
};

// Make it available globally in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  window.runAuthDiagnostics = runAuthDiagnostics;
  console.log('🔧 Auth diagnostics available: window.runAuthDiagnostics()');
}

export default runAuthDiagnostics;
