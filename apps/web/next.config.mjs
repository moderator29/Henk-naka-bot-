/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@aurora/design-system", "@aurora/contracts"],
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    // Enables instrumentation.ts (Sentry server/edge init) on Next 14.2.
    instrumentationHook: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "ipfs.io" },
      { protocol: "https", hostname: "*.ipfs.nftstorage.link" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    // Optional deps pulled in by wagmi / WalletConnect / MetaMask connectors
    // that aren't needed on the web build. Externalizing (server) and aliasing
    // to false (client) silences the harmless "Module not found" warnings for
    // @react-native-async-storage/async-storage and pino-pretty without
    // changing runtime behavior.
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    // Silence OpenTelemetry/Sentry "Critical dependency: the request of a
    // dependency is an expression" notices, which are expected and harmless.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      { module: /@opentelemetry\/instrumentation/ },
      { module: /require-in-the-middle/ },
      { message: /Critical dependency: the request of a dependency is an expression/ },
    ];
    return config;
  },
};

export default nextConfig;
