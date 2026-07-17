import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Vitest config — minimal, deliberately conservative.
 *
 * - `environment: "node"` because every test in this repo so far is a
 *   server-side lib or route handler. JSDOM only gets pulled in when
 *   the first browser-dependent test arrives.
 * - `@` alias mirrors what Next/TS resolve at runtime so `import x from
 *   "@/lib/..."` works the same in tests as in the route handlers.
 * - No setup file, no global mocks: each test imports what it needs.
 *   The pattern keeps the test surface inspectable from the file.
 */
export default defineConfig({
  test: {
    environment: "node",
    // `src/**` covers the app libs/routes. `scripts/**/*.test.mjs` lets
    // dependency-free harnesses (e.g. the skills-eval harness) live next to
    // their code. `.tsx` under emails/ covers the React Email templates
    // (bilingual render tests); renderToStaticMarkup runs fine in node env.
    include: [
      "src/**/*.test.ts",
      "scripts/**/*.test.mjs",
      "emails/**/*.test.tsx",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
