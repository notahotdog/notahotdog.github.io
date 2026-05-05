import { defineConfig, envField, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import { visit } from "unist-util-visit";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";

// Transform ```mermaid code fences into raw <pre class="mermaid">…</pre>
// so client-side mermaid.js can render them. Bypasses Shiki for mermaid only.
function remarkMermaid() {
  return (tree: import("mdast").Root) => {
    visit(tree, "code", (node: import("mdast").Code) => {
      if (node.lang !== "mermaid") return;
      const value = node.value ?? "";
      const escaped = value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const htmlNode = node as unknown as import("mdast").Html;
      htmlNode.type = "html";
      htmlNode.value = `<pre class="mermaid">${escaped}</pre>`;
    });
  };
}
import { transformerFileName } from "./src/utils/transformers/fileName";
import { SITE } from "./src/config";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [
    sitemap({
      filter: page => SITE.showArchives || !page.endsWith("/archives"),
    }),
  ],
  markdown: {
    remarkPlugins: [
      remarkMermaid,
      remarkToc,
      [remarkCollapse, { test: "Table of contents" }],
    ],
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    // eslint-disable-next-line
    // @ts-ignore
    // This will be fixed in Astro 6 with Vite 7 support
    // See: https://github.com/withastro/astro/issues/14030
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  image: {
    responsiveStyles: true,
    layout: "constrained",
  },
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    preserveScriptOrder: true,
    fonts: [
      {
        name: "Geist",
        cssVariable: "--font-sans",
        provider: fontProviders.google(),
        fallbacks: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        weights: [400, 500, 600, 700],
        styles: ["normal"],
      },
      {
        name: "Geist Mono",
        cssVariable: "--font-mono",
        provider: fontProviders.google(),
        fallbacks: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        weights: [400, 500],
        styles: ["normal"],
      },
    ],
  },
});
