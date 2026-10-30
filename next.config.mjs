/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  transpilePackages: ['@react-three/fiber', '@react-three/drei', 'three'],
  images: {
    unoptimized: true,
  },
  // If deploying to username.github.io/repo-name, set basePath: '/repo-name'
};

export default nextConfig;
