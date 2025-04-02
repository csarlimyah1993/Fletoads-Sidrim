/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

export default nextConfig;

