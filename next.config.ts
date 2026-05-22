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
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: '/docuseal/:path*',
  //       destination: `http://localhost:9000/:path*`,
  //     },
  //   ]
  // },
};

export default nextConfig;
