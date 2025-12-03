/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // API rewrites to proxy requests to Express backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*',
      },
      {
        source: '/socket.io/:path*',
        destination: 'http://localhost:5001/socket.io/:path*',
      },
    ];
  },

  // Environment variables available to the browser
  env: {
    // Your existing variable names
    VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:5001/api',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    API_KEY: process.env.GEMINI_API_KEY || '', // Alias
    GOOGLE_MAPS_KEY: process.env.GOOGLE_MAPS_KEY || '',
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Webpack configuration for external modules
  webpack: (config, { isServer }) => {
    // Handle canvas for leaflet if needed
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
