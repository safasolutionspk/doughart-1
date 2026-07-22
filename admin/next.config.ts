import type { NextConfig } from "next";

function getApiImagePattern(): {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
} | null {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return {
      protocol: "http",
      hostname: "localhost",
      port: "5000",
      pathname: "/uploads/**",
    };
  }

  try {
    const parsed = new URL(apiUrl);
    return {
      protocol: parsed.protocol === "https:" ? "https" : "http",
      hostname: parsed.hostname,
      ...(parsed.port ? { port: parsed.port } : {}),
      pathname: "/uploads/**",
    };
  } catch {
    return null;
  }
}

const apiPattern = getApiImagePattern();

const cloudinaryPattern = {
  protocol: "https" as const,
  hostname: "res.cloudinary.com",
  pathname: "/**",
};

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      ...(apiPattern ? [apiPattern] : []),
      cloudinaryPattern,
    ],
  },
};

export default nextConfig;
