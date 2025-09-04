// Modern gradient utilities for AdCopySurge
export const gradients = {
  // Primary brand gradients
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  primaryLight: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  primaryDark: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
  
  // Purple gradients (matches your theme)
  purple: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)',
  purpleBlue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  
  // Modern tech gradients
  sunset: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
  ocean: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  cosmic: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  
  // Subtle gradients for backgrounds
  softBlue: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
  softGray: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  
  // Radial gradients for modern effects
  radialPrimary: 'radial-gradient(circle at 30% 30%, #667eea 0%, #764ba2 100%)',
  radialPurple: 'radial-gradient(circle at 50% 50%, #7c3aed 0%, #1e1b4b 100%)',
  
  // Button gradients
  buttonPrimary: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  buttonSecondary: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
  buttonHover: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  
  // Glass morphism effect
  glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  
  // Authentication page specific gradients
  authBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  authBackgroundAlt: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #667eea 100%)',
  
  // Card overlays
  cardOverlay: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
  darkCardOverlay: 'linear-gradient(135deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.02) 100%)',
};

// Helper function to create gradient backgrounds with fallbacks
export const createGradientBackground = (gradientName, fallbackColor = '#f8fafc') => ({
  background: gradients[gradientName] || gradients.softGray,
  backgroundAttachment: 'fixed',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  minHeight: '100vh',
  // Fallback for older browsers
  backgroundColor: fallbackColor,
});

// Helper for creating gradient text
export const createGradientText = (gradientName) => ({
  background: gradients[gradientName] || gradients.primary,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  display: 'inline-block',
});

// Helper for creating gradient borders
export const createGradientBorder = (gradientName, borderWidth = '2px') => ({
  border: `${borderWidth} solid transparent`,
  backgroundImage: `${gradients[gradientName] || gradients.primary}, linear-gradient(white, white)`,
  backgroundClip: 'border-box, padding-box',
  backgroundOrigin: 'border-box, padding-box',
});

// Animation keyframes for gradient shifts
export const gradientAnimation = {
  backgroundSize: '200% 200%',
  animation: 'gradientShift 6s ease infinite',
  '@keyframes gradientShift': {
    '0%': {
      backgroundPosition: '0% 50%',
    },
    '50%': {
      backgroundPosition: '100% 50%',
    },
    '100%': {
      backgroundPosition: '0% 50%',
    },
  },
};

export default gradients;
