"use client";
import { useTranslations } from "next-intl";
import { Moon, Sun } from "lucide-react";

// Borda rasgada: muitos pontos ao longo da diagonal com "fibras" irregulares.
// Pseudoaleatório determinístico (o rasgo não treme entre frames): mistura um dente grande e ruído fino.
const TEETH = Array.from({ length: 360 }, (_, i) => {
  const r = (n: number) => ((Math.sin(n * 12.9898) * 43758.5453) % 1 + 1) % 1;
  const wave = Math.sin(i * 0.21) * 0.9 + Math.sin(i * 0.067 + 1.3) * 1.2; // ondulação lenta
  const grain = (r(i * 7.1) - 0.5) * 1.1;                                  // irregularidade média
  const fiber = (i % 2 ? 1 : -1) * r(i) * 0.35;                           // serrilha fina das fibras
  return wave + grain + fiber;
});

// Polígono que cobre o lado superior-direito da linha (100 - x) + y = d, em % da tela.
function tear(d: number) {
  const pts = TEETH.map((j, i) => {
    const x = -100 + (300 * i) / (TEETH.length - 1);
    return `${x + j}% ${x + d - 100 - j}%`;
  });
  return `polygon(${pts.join(",")}, 400% -400%)`;
}

const apply = () => {
  const dark = document.documentElement.classList.toggle("dark");
  try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch {}
};

export function ThemeToggle() {
  const t = useTranslations("nav");

  const toggle = () => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduce) return apply();

    const vt = document.startViewTransition(apply);
    vt.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [tear(-20), tear(220)] },
        { duration: 1100, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
  };

  return (
    <button
      type="button"
      aria-label={t("theme")}
      onClick={toggle}
      className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </button>
  );
}
