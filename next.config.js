const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare')

initOpenNextCloudflareForDev()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
};

module.exports = nextConfig;
