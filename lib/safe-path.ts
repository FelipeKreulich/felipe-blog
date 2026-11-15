// Normaliza um destino de redirect para um caminho interno. Qualquer coisa que resolva
// para outra origem (//evil.com, /\evil.com, controles, esquemas) vira "/".
const BASE = "http://internal.invalid";

export function safePath(v: unknown): string {
  if (typeof v !== "string" || !v.startsWith("/") || /[\\\u0000-\u001f]/.test(v)) return "/";
  try {
    const u = new URL(v, BASE);
    return u.origin === BASE ? u.pathname + u.search : "/";
  } catch {
    return "/";
  }
}

// Autoteste: npx tsx lib/safe-path.ts
if (process.argv[1]?.endsWith("safe-path.ts")) {
  const cases: [unknown, string][] = [
    ["/posts/x?a=1", "/posts/x?a=1"], ["//evil.com", "/"], ["/\\evil.com", "/"], ["https://evil.com", "/"],
    ["/%5Cevil.com", "/%5Cevil.com"], ["/\tevil", "/"], [null, "/"], ["javascript:alert(1)", "/"], ["/en", "/en"],
  ];
  for (const [i, want] of cases) console.assert(safePath(i) === want, `safePath(${JSON.stringify(i)}) = ${safePath(i)}, esperado ${want}`);
  console.log("safe-path ok");
}
