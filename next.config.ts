import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//     module.exports = {
//     images: {
//       domains: ["res.cloudinary.com"],
//     },
//   };
// };

// export default nextConfig;
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
