// Formato do conteúdo editorial versionado no repositório (publicado por scripts/publish-content.ts).
export type ContentLang = {
  slug: string;    // kebab-case, sem acentos, único por idioma
  title: string;
  excerpt: string; // 1–2 frases, até ~240 caracteres
  body: string;    // Markdown; começa com um parágrafo (vira capitular); subtítulos com "## "
};

export type ContentPost = {
  key: string;           // id estável do post neste repositório
  cover: string;         // nome do arquivo em public/covers sem extensão (.jpg)
  tags: TagSlug[];
  daysAgo: number;       // data de publicação relativa à primeira publicação
  pt: ContentLang;
  en: ContentLang;
};

export const TAGS = [
  { slug: "ai", namePt: "IA", nameEn: "AI" },
  { slug: "security", namePt: "Segurança", nameEn: "Security" },
  { slug: "languages", namePt: "Linguagens", nameEn: "Languages" },
  { slug: "web", namePt: "Web", nameEn: "Web" },
  { slug: "databases", namePt: "Bancos de dados", nameEn: "Databases" },
  { slug: "infra", namePt: "Infraestrutura", nameEn: "Infrastructure" },
  { slug: "culture", namePt: "Cultura", nameEn: "Culture" },
] as const;
export type TagSlug = (typeof TAGS)[number]["slug"];
