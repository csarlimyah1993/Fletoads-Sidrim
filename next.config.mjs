const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "**.vercel.app",
      },
      {
        protocol: "https",
        hostname: "**.blob.vercel-storage.com",
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    domains: [
      "picsum.photos",
      "via.placeholder.com",
      'xaywsd0belf9yeug.public.blob.vercel-storage.com',
      'public.blob.vercel-storage.com',
      'vercel-storage.com',
      'vercel-blob.com'
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
    // Removemos nodeMiddleware daqui
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
        aws4: false,
      };
    }
    return config;
  },
  webpack: (config) => {
    // Configuração explícita do alias
    config.resolve.alias['@'] = path.resolve(__dirname);
    
    // Se você tiver outras configurações webpack, mantenha-as aqui
    return config;
  },
};

export default nextConfig;