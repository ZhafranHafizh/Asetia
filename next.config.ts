/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nsklkwirknxjtljkejzp.supabase.co', // Sesuai dengan hostname di error Anda
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Allow up to 10MB for image uploads
    },
  },
};

export default nextConfig;