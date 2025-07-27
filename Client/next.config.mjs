import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from the project root .env file
config({ path: resolve(__dirname, '..', '.env') })

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
