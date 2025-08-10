// Deployment configuration for different platforms
export const deploymentConfig = {
  isNetlify: typeof window !== 'undefined' && window.location.hostname.includes('netlify'),
  isVercel: typeof window !== 'undefined' && window.location.hostname.includes('vercel'),
  isTermux: typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname.includes('192.168') ||
    window.location.hostname.includes('10.0')
  ),
  
  getApiEndpoint: () => {
    if (typeof window === 'undefined') return '/api'; // Server-side
    
    const config = deploymentConfig;
    
    if (config.isNetlify) {
      return '/.netlify/functions';
    } else if (config.isVercel) {
      return '/api';
    } else {
      return '/api'; // Default for Termux and development
    }
  },
  
  supportsServerSideProcessing: () => {
    if (typeof window === 'undefined') return true; // Server-side
    
    const config = deploymentConfig;
    return !config.isNetlify; // Netlify doesn't support server-side API routes
  }
};

export default deploymentConfig;