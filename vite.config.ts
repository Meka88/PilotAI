import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

/**
 * Inject/keep the Meticulous recorder only when recording locally.
 * CI production builds used for replay must NOT include the recorder script —
 * it can return 400s during simulation and blank the app.
 */
function meticulousRecorderPlugin(shouldRecord: boolean): Plugin {
  return {
    name: "meticulous-recorder-gate",
    transformIndexHtml(html) {
      if (shouldRecord) return html;
      return html.replace(
        /\s*<!-- Meticulous recorder[\s\S]*?<\/script>\n?/m,
        "\n",
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const shouldRecord =
    mode === "development" || process.env.VITE_METICULOUS_RECORD === "true";

  return {
    plugins: [react(), meticulousRecorderPlugin(shouldRecord)],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      port: 5173,
      host: true,
    },
    preview: {
      port: 4173,
      host: true,
    },
  };
});
