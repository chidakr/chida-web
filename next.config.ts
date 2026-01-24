/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn3d.iconscout.com', // 아까 넣은 것
      },
      {
        protocol: 'https',
        hostname: 'grainy-gradients.vercel.app', // 아까 넣은 것
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org', // 아까 넣은 것
      },
      // 👇 여기! 이 녀석을 추가해주세요
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;