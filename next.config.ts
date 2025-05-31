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
  experimental: {
    esmExternals: 'loose'
  }
};

export default nextConfig;
