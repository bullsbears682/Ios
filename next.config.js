/** @type {import('next').NextConfig} */
const nextConfig = {
  // Netlify deployment settings - static export
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  // Mobile-freundlich
  images: {
    unoptimized: true
  },
  
  // Bessere Performance auf schwächeren Geräten
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Webpack-Optimierungen für Termux
  webpack: (config, { isServer }) => {
    // Reduziere Bundle-Größe
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    
    // Optimiere für ARM64 (Android)
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    };
    
    return config;
  },
  
  // Umgebungsvariablen
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;