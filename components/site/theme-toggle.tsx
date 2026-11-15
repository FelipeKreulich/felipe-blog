"use client";
import { useTranslations } from "next-intl";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const t = useTranslations("nav");
  const toggle = () => {
    const dark = document.documentElement.classList.toggle("dark");
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch {}
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
