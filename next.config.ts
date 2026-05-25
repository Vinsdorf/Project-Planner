import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable React strict mode for better development warnings
  reactStrictMode: true,
  // Optimize package imports
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
}

export default nextConfig
