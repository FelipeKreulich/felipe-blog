"use client";

// Último recurso: só aparece se o próprio layout quebrar. Sem dependências (o layout caiu).
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", background: "#f3eee3", color: "#2b2a28", fontFamily: "Georgia, serif" }}>
        <main style={{ textAlign: "center", padding: 24 }}>
          <p style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#a8341f" }}>Erro · Error</p>
          <h1 style={{ fontWeight: 400, fontSize: 44, margin: "12px 0" }}>A prensa parou.</h1>
          <p>Algo deu errado. Something went wrong.</p>
          <button onClick={reset} style={{ marginTop: 16, background: "#2b2a28", color: "#f3eee3", border: 0, padding: "10px 18px", fontFamily: "monospace", textTransform: "uppercase", cursor: "pointer" }}>
            Tentar de novo
          </button>
        </main>
      </body>
    </html>
  );
}
