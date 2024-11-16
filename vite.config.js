import { defineConfig, loadEnv } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import commonjs from "vite-plugin-commonjs";

export default defineConfig((command, mode) => {
  const env = loadEnv(mode, process.cwd(), "");

  const processEnvValues = {
    "process.env": Object.entries(env).reduce(
      (prev, [key, val]) => ({
        ...prev,
        [key]: val,
      }),
      {}
    ),
  };

  const HTTPS = env.HTTPS === "true";
  const PORT = env.PORT ?? 4000;

  return {
    server: {
      open: true,
      https: HTTPS,
      port: PORT,
      strictPort: true,
    },
    build: {
      outDir: "build",
      commonjsOptions: { transformMixedEsModules: true },
    },
    plugins: [react(), basicSsl(), commonjs()],
    resolve: {
      alias: {
        src: "/src",
        assets: "/src/assets",
        components: "/src/components",
        context: "/src/context",
        data: "/src/data",
        hooks: "/src/hooks",
        pages: "/src/pages",
        sections: "/src/sections",
        utils: "/src/utils",
      },
    },
    define: processEnvValues,
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler' // or "modern"
        }
      }
    },
  };
});
