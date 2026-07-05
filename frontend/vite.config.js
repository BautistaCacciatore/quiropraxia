import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  // Le dice a Vite que busque el .env en la raíz del proyecto
  // (un nivel arriba de frontend/), para no duplicar el archivo.
  envDir: path.resolve(__dirname, ".."),
  server: {
    port: 5173,
  },
});