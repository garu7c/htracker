import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: '.next',
  reactCompiler: true,
  output: 'standalone', 
  trailingSlash: true,
  images: {
    domains: [],
  },
};

export default nextConfig;
