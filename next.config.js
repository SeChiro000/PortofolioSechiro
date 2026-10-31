const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare')

const isGitHubPagesBuild = process.env.GITHUB_PAGES === 'true'

if (!isGitHubPagesBuild) {
  initOpenNextCloudflareForDev()
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@react-three/fiber', '@react-three/drei', 'three'],
  ...(isGitHubPagesBuild
    ? {
        output: 'export',
        images: { unoptimized: true },
        basePath: '/PortofolioSechiro',
        assetPrefix: '/PortofolioSechiro/',
      }
    : {}),
};

module.exports = nextConfig;
