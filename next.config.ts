import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude socket.io-client from server-side bundle
      config.externals.push({
        'socket.io-client': 'socket.io-client',
      });
    }
    return config;
  },
};

export default nextConfig;
