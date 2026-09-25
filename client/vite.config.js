import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5174,
    strictPort: false,
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
