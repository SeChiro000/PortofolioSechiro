/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  transpilePackages: ['@react-three/fiber', '@react-three/drei', 'three'],
  images: {
    unoptimized: true,
  },
  basePath: '/PortofolioSechiro',
  assetPrefix: '/PortofolioSechiro/',
};

export default nextConfig;
