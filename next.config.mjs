/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove Vercel watermark/branding
  poweredByHeader: false,
  
  // Optimize for production
  compress: true,
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Headers configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Powered-By',
            value: 'GitHub Webhook Dashboard',
          },
        ],
      },
    ]
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Images configuration
  images: {
    unoptimized: true,
  },
}

export default nextConfig
