import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "epub2", "mammoth"],
}

export default nextConfig
