import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "aquamarine-used-bear-228.mypinata.cloud",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "yellow-patient-hare-489.mypinata.cloud",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
