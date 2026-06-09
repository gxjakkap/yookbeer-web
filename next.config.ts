import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	/* config options here */
	output: "standalone",
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "*.r2.cloudflarestorage.com",
			},
		],
	},
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
}

export default nextConfig
