import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Built into the labs repo's /vibe-keyboard/ route as plain static files.
export default defineConfig({
  plugins: [react()],
  base: "/vibe-keyboard/",
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 1200,
    outDir: "../../vibe-keyboard",
    emptyOutDir: true,
  },
});
