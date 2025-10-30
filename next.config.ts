import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Formatos modernos de imagem (WebP/AVIF)
    formats: ['image/avif', 'image/webp'],

    // Device sizes para responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // Image sizes para diferentes breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Minimize layout shift
    minimumCacheTTL: 60,

    // Domínios permitidos
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'external-content.duckduckgo.com',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'uploadthing.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
    domains: [
      'localhost',
      'external-content.duckduckgo.com',
      'unsplash.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
      'i.imgur.com',
      'imgur.com',
      'uploadthing.com',
    ]
  }
};

export default nextConfig;
