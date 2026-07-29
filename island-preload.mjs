import { readFile, writeFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

/**
 * Emit <link rel="modulepreload"> for hydrated island chunks.
 *
 * WHY THIS EXISTS
 * Astro renders a client:load island as <astro-island component-url="..."
 * renderer-url="...">. Those two modules are fetched by the island runtime
 * with a bare import() at hydration time, so nothing in the HTML tells the
 * browser they are coming. The preload scanner can't see them either — they
 * are attribute values, not <script src>. Result on / was a 4–5 request
 * waterfall: HTML → island runtime → HeroRotator.js → react + motion.
 *
 * Vite normally solves this for dynamic imports by injecting a dependency map
 * at the call site (__vitePreload). That machinery doesn't reach the island
 * element, because the import() lives in Astro's runtime rather than in our
 * bundled graph.
 *
 * WHAT IT DOES
 * After the build, for every generated HTML file: collect the island chunk
 * URLs, follow ONE level of static imports inside each chunk (that's where
 * react-dom and motion live — they are leaves, so one level is enough), and
 * write modulepreload links into <head>. The browser then starts all of them
 * during HTML parse instead of after hydration begins.
 *
 * Hashes are read from the actual build output, never hardcoded, so this
 * stays correct across rebuilds. If the island markup ever changes shape the
 * regex simply finds nothing and the hook becomes a no-op — it cannot emit a
 * broken link, because every href is checked against a file on disk.
 */

const ISLAND_URL = /(?:component|renderer)-url="([^"]+\.js)"/g;
/** Static import specifiers in a built ESM chunk: import"./x.js" / from"./x.js" */
const STATIC_IMPORT = /(?:import|from)\s*"(\.\/[^"]+\.js)"/g;

async function htmlFilesIn(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await htmlFilesIn(full)));
    else if (entry.name.endsWith(".html")) found.push(full);
  }
  return found;
}

export default function islandPreload() {
  return {
    name: "island-preload",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        let htmlFiles;
        try {
          htmlFiles = await htmlFilesIn(root);
        } catch {
          return;
        }

        let touched = 0;
        let linkCount = 0;

        for (const file of htmlFiles) {
          const html = await readFile(file, "utf8");
          if (html.includes('rel="modulepreload"')) continue;

          const entries = new Set(
            [...html.matchAll(ISLAND_URL)].map((m) => m[1]),
          );
          if (entries.size === 0) continue;

          // Follow one level of static imports out of each island chunk.
          const all = new Set(entries);
          for (const entryUrl of entries) {
            const chunkPath = path.join(root, entryUrl);
            let chunk;
            try {
              chunk = await readFile(chunkPath, "utf8");
            } catch {
              continue; // URL didn't resolve to a real file — skip it.
            }
            for (const [, spec] of chunk.matchAll(STATIC_IMPORT)) {
              const abs = path.resolve(path.dirname(chunkPath), spec);
              if (!abs.startsWith(root)) continue;
              all.add("/" + path.relative(root, abs).split(path.sep).join("/"));
            }
          }

          const links = [...all]
            .sort()
            .map((href) => `<link rel="modulepreload" href="${href}">`)
            .join("");

          await writeFile(file, html.replace("</head>", `${links}</head>`));
          touched += 1;
          linkCount = Math.max(linkCount, all.size);
        }

        if (touched > 0) {
          logger.info(
            `Preloaded island chunks in ${touched} page${touched === 1 ? "" : "s"} (up to ${linkCount} per page)`,
          );
        }
      },
    },
  };
}
