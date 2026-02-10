/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Solo durante el desarrollo
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
