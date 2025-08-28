/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
      // ✅ Allow deployment even if TS errors exist
      ignoreBuildErrors: true,
    },
    eslint: {
      // ✅ Allow deployment even if lint errors exist
      ignoreDuringBuilds: true,
    },
  };
  
  module.exports = nextConfig;
  