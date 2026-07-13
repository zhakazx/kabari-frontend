import type { NextConfig } from "next";

const imageRemotePatterns: NonNullable<
  NextConfig["images"]
>["remotePatterns"] = [
  // Backend on localhost during dev.
  { protocol: "http", hostname: "localhost", port: "8000", pathname: "/**" },
  { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/**" },
  // Public S3 / CDN buckets used by the backend. Override in deployment
  // via NEXT_PUBLIC_IMAGE_HOSTNAMES (comma-separated).
];

if (process.env.NEXT_PUBLIC_IMAGE_HOSTNAMES) {
  for (const hostname of process.env.NEXT_PUBLIC_IMAGE_HOSTNAMES.split(",")
    .map((h) => h.trim())
    .filter(Boolean)) {
    imageRemotePatterns.push({
      protocol: "https",
      hostname,
      pathname: "/**",
    });
  }
}

// The backend serves uploaded files (template thumbnails, template files,
// event galleries) at `/uploads/*` *outside* the `/api/v1` prefix. It
// returns these as relative URLs in API responses, which the browser would
// otherwise resolve against the Next.js origin (e.g. `localhost:3000`) and
// 404. Proxying `/uploads/*` to the backend keeps the URLs in the response
// unchanged while letting `<img>` / `next/image` load them transparently.
function backendOrigin(): string | undefined {
  const base = process.env.API_BASE_URL;
  if (!base) return undefined;
  try {
    return new URL(base).origin;
  } catch {
    return undefined;
  }
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: imageRemotePatterns,
  },
  async rewrites() {
    const origin = backendOrigin();
    if (!origin) return [];
    return [
      {
        source: "/uploads/:path*",
        destination: `${origin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
