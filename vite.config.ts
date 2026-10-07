import { defineConfig, type Connect, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { createRequire } from "module";
import type { IncomingMessage, ServerResponse } from "http";

const require = createRequire(import.meta.url);
const FN_NAME_RE = /^[a-zA-Z0-9_-]+$/;

function netlifyFunctionsPlugin() {
  return {
    name: 'netlify-functions-middleware',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
        try {
          if (!req.url || !req.url.startsWith('/.netlify/functions/')) return next();
          const url = new URL(req.url, 'http://localhost');
          const parts = url.pathname.split('/').filter(Boolean);
          const fnName = parts[parts.indexOf('functions') + 1];
          if (!fnName || !FN_NAME_RE.test(fnName)) return next();
          const fnPath = path.resolve(process.cwd(), 'netlify', 'functions', `${fnName}.js`);
          const raw = await new Promise<Buffer>((resolve) => {
            const chunks: Buffer[] = [];
            req.on('data', (c: Buffer) => chunks.push(Buffer.from(c)));
            req.on('end', () => resolve(Buffer.concat(chunks)));
            req.on('error', () => resolve(Buffer.alloc(0)));
          });
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            queryStringParameters: Object.fromEntries(url.searchParams),
            body: raw && raw.length ? raw.toString() : undefined,
            rawBody: raw
          };
          delete require.cache[require.resolve(fnPath)];
          const mod = require(fnPath);
          const handler = mod.handler || mod.default || mod;
          const result = await handler(event);
          const statusCode = result?.statusCode ?? 200;
          const headers = result?.headers ?? { 'Content-Type': 'application/json' };
          res.writeHead(statusCode, headers);
          res.end(result?.body ?? '');
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          if ((err as NodeJS.ErrnoException)?.code === 'MODULE_NOT_FOUND' || /Cannot find module/.test(message)) return next();
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: message }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    hmr: { overlay: false },
  },
  plugins: [
    react(),
    mode === "development" && netlifyFunctionsPlugin()
  ].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    sourcemap: false,
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      // No `manualChunks` here on purpose. The hand-written version this
      // replaces was actively hurting first load: rolldown does not honour
      // manualChunks for CommonJS modules, so React's CJS build ended up
      // inside the `vendor-charts` chunk (and react/jsx-runtime inside
      // `vendor-motion`) no matter where the react rule sat in that
      // function — confirmed by decoding the emitted chunk sourcemaps.
      // Because React lived in the charts chunk, every page had to preload
      // it, so the landing page — which renders no charts at all — was
      // downloading ~446 KiB of recharts before it could paint.
      //
      // Measured on the landing page, uncompressed JS over the wire:
      //   with manualChunks: 28 requests, 1362.5 KiB
      //   rolldown default:  67 requests,  865.5 KiB   (-36%)
      // Adding explicit advancedChunks groups on top of this was tested
      // and changed nothing (byte-identical output), so none are kept.
      // The extra requests are content-hashed, immutable assets served
      // over HTTP/2 — see netlify.toml's /assets/* cache rule.
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },
    chunkSizeWarningLimit: 600,
  },
}));
