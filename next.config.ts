import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // gRPC-based GCP library — opt out of bundling so it uses native Node require.
  serverExternalPackages: ["@google-cloud/recaptcha-enterprise"],
};

export default nextConfig;
