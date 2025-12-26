import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    outDir: "../mdream/dist/frontend",
    emptyOutDir: true,
  },
  server: {
    port: 4343,
    proxy: {
      "/api": {
        target: "http://localhost:4242",
      },
    },
  },
});
