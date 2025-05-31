import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle canvas dependency for some packages
      config.externals = config.externals || [];
      config.externals.push({
        'canvas': 'canvas'
      });
    }
    
    return config;
  },
  typescript:{
    // Disable type checking during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disable ESLint during build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
