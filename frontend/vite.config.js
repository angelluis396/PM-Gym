import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Makes client-side routes like /login and /auth/callback work on refresh
    historyApiFallback: true,
  },
});