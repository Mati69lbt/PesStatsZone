// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/PesStatsZone/", // nombre EXACTO del repo
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
});
