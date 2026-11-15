import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  devIndicators: false,
  // O client do Prisma fica numa pasta própria (lib/generated/prisma); sem isto o binário do
  // query engine não entra no pacote das funções serverless e toda consulta em runtime quebra.
  outputFileTracingIncludes: { "/**/*": ["./lib/generated/prisma/**/*.node"] },
};

export default createNextIntlPlugin()(nextConfig);
