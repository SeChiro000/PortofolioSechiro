/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@react-three/fiber', '@react-three/drei', 'three'],
};

module.exports = nextConfig;
