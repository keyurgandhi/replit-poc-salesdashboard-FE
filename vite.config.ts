import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  // FORCES VITE TO REPLACE THE VARIABLE WITH THE GITHUB ACTIONS ENV VALUE AT BUILD TIME
  define: {
    "import.meta.env.VITE_BACKEND_URL": process.env.VITE_BACKEND_URL 
      ? JSON.stringify(process.env.VITE_BACKEND_URL) 
      : "import.meta.env.VITE_BACKEND_URL", // leaves it alone locally so Vite reads .env.local
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  preview: {
    port: 3000,
    host: "0.0.0.0",
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
