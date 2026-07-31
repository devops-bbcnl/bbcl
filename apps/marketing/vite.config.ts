import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const mailApiPort = env.MAIL_API_PORT || "3001";
  // Dev server port: use Vite default (5173), not 8080 — Netlify sets PORT=8080 during
  // builds and secret scanning flags matching literals in repo/build output.
  const devServerPort = Number.parseInt(env.VITE_DEV_SERVER_PORT || "", 10) || 5173;

  return {
    server: {
      host: "::",
      port: devServerPort,
      hmr: {
        overlay: false,
      },
      proxy: {
        "/api": {
          target: `http://127.0.0.1:${mailApiPort}`,
          changeOrigin: true,
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
  };
});
