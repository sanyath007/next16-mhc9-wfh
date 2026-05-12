import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@prisma/client', 'prisma'],
  async headers() {
    return [
      {
        source: "/uploads/:file*",
        headers: [
          { key: "Content-Disposition", value: "attachment"}
        ]
      }
    ]
  }
};

export default nextConfig;
