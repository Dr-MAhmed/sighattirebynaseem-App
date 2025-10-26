/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  serverExternalPackages: ["@highlight-run/node", "require-in-the-middle"],
  experimental: {
    serverActions: { bodySizeLimit: "15MB" },
    scrollRestoration: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sighattirebynaseem.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
      };
    }
    return config;
  },
  redirects: async () => {
    return [
      //  /$ to /
      {
        source: "/$",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
