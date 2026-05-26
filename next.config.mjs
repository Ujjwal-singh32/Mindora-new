/** @type {import('next').NextConfig} */
export const runtime = "node";

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve = {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          canvas: false,   // 👈 tells webpack to return empty module
          konva: false,
        },
      };
    }
    return config;
  },
};

export default nextConfig;