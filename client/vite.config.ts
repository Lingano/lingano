import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: "../api/client/build", // Output the build to api/client/build
    },
});
