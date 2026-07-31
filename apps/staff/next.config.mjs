import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Pin the workspace root explicitly — an unrelated package-lock.json sitting in
// the Windows user profile root (C:\Users\<user>\package-lock.json, outside this
// repo) confuses Next's automatic monorepo-root inference, which otherwise silently
// walks up and traces files from the wrong directory entirely.
const workspaceRoot = path.resolve(__dirname, "..", "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: workspaceRoot,
};

export default nextConfig;
