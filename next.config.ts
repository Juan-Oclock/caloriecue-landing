import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Normalize trailing slashes - prevents duplicate URL issues for SEO
  trailingSlash: false,
};

export default nextConfig;
