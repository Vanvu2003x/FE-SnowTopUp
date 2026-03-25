/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS domains for now
      },
    ],
  },
  // Fix for Next.js 15 streaming bug
  experimental: {
    // Disable problematic streaming features
    ppr: false,
  },
  // Suppress streaming-related warnings
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
