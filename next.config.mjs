/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vktwoahyxelqhgmeimjd.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/Cabin_images/**",
      },
    ],
  },
  // output: "export",
};

export default nextConfig;
