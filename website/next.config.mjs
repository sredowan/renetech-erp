/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  skipTrailingSlashRedirect: true,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.vecteezy.com',
      },
      {
        protocol: 'https',
        hostname: 'languageacademy.com.bd',
      },
      {
        protocol: 'https',
        hostname: 'darkslateblue-cormorant-104679.hostingersite.com',
      },
    ],
  },
};

export default nextConfig;
