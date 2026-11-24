import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Built into the labs repo's /relocation-card/ route as plain static files.
export default defineConfig({
  plugins: [react()],
  base: "/relocation-card/",
  build: {
    outDir: "../../relocation-card",
    emptyOutDir: true,
  },
});
