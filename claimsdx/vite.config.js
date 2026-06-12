import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:   ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"],
          icons:    ["lucide-react"],
        },
      },
    },
  },
  server: { port: 5173 },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.js"],
    include: ["src/__tests__/**/*.{test,spec}.{js,jsx}"],
    coverage: {
      reporter: ["text", "html"],
      include:  ["src/**/*.{js,jsx}"],
      exclude:  ["src/main.jsx", "src/__tests__/**"],
    },
  },
});

