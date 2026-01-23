/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn3d.iconscout.com', // 3D 이미지 사이트 허용
      },
      {
        protocol: 'https',
        hostname: 'grainy-gradients.vercel.app', // 노이즈 배경 허용
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org', // 바코드 등 허용
      }
    ],
  },
};

export default nextConfig;