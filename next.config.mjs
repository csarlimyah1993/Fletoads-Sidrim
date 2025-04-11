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
  },
  images: {
    domains: [
      "picsum.photos",
      "via.placeholder.com",
      'xaywsd0belf9yeug.public.blob.vercel-storage.com',
      'public.blob.vercel-storage.com',
      'vercel-storage.com',
      'vercel-blob.com'],
  },
  experimental: {
    serverExternalPackages: ['mongoose'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Não incluir módulos do lado do servidor no bundle do cliente
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
};

export default nextConfig;

