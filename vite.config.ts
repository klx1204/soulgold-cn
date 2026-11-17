import { defineConfig } from "vite";
import process from "node:process";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Project pages live under https://<user>.github.io/soulgold-cn/
// Override with BASE_PATH when serving from a custom domain.
const base = process.env.BASE_PATH ?? "/soulgold-cn/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1200,
  },
});
