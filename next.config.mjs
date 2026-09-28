/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/the-great-lock-in-of-sept-dec-2',
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