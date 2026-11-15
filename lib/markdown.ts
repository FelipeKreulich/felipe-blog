import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

// Markdown -> HTML no servidor. Sem HTML cru (remark-rehype descarta por padrão) = seguro contra XSS.
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypePrettyCode, { theme: { light: "github-light", dark: "github-dark-dimmed" }, keepBackground: false })
  .use(rehypeStringify);

export async function renderMarkdown(md: string) {
  return String(await processor.process(md));
}
