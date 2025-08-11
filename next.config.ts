import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Turbopack dev loader to import .glsl files as raw strings
  turbopack: {
    rules: {
      "*.glsl": {
        loaders: [
          {
            loader: "raw-loader",
            options: { esModule: true },
          },
        ],
        as: "*.js",
      },
    },
    resolveExtensions: [".glsl", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.glsl$/i,
      type: "asset/source",
    });
    return config;
  },
};

export default nextConfig;
