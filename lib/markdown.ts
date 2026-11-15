import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Root } from "hast";

// Allow only http(s), mailto, or relative URLs (no scheme). Drops javascript:, data:, vbscript:, etc.
const SAFE_URL = /^(?:https?:|mailto:|[/#?]|[^:/?#]*(?:[/?#]|$))/i;

function rehypeSafeLinks() {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      const p = node.properties;
      for (const attr of ["href", "src"]) {
        const v = p[attr];
        if (v != null && !SAFE_URL.test(String(v).trim())) delete p[attr];
      }
      if (node.tagName === "a" && typeof p.href === "string" && /^https?:/i.test(p.href)) {
        p.rel = ["noopener", "noreferrer"];
      }
    });
  };
}

// Markdown -> HTML no servidor. Sem HTML cru (remark-rehype descarta por padrão) = seguro contra XSS.
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSafeLinks)
  .use(rehypePrettyCode, { theme: { light: "github-light", dark: "github-dark-dimmed" }, keepBackground: false })
  .use(rehypeStringify);

export async function renderMarkdown(md: string) {
  return String(await processor.process(md));
}
