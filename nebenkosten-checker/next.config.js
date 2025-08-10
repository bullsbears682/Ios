/** @type {import('next').NextConfig} */
const nextConfig = {
  // Termux-optimiert
  experimental: {
    esmExternals: false,
  },
  
  // Mobile-freundlich
  images: {
    unoptimized: true
  },
  
  // Kleinere Bundle-Größe
  swcMinify: true,
  
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
  
  // Headers für bessere API-Performance
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
  
  // Umgebungsvariablen
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;