import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: '.next',
  reactCompiler: true,
  // Añadir estas configuraciones
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  // Para evitar el error de cookies
  output: 'standalone',
};

export default nextConfig;