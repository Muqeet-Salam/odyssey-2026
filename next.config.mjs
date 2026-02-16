/** @type {import('next').NextConfig} */
const nextConfig = {
  // Generate unique build IDs to help with chunk cache invalidation
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
