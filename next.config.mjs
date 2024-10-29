/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
      },
    ],
  },
  headers: [
    {
      key: 'Access-Control-Allow-Origin',
      value: '/',
    },
  ],
};

export default nextConfig;
