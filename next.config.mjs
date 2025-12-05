/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  // External packages that should not be bundled for server
  serverExternalPackages: ['pino', 'pino-pretty'],
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ignore Node.js modules on client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        child_process: false,
        worker_threads: false,
      };
    }
    return config;
  },
}

export default nextConfig
