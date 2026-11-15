import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";

// Toda rota/ação do admin passa por aqui. Não-admin recebe 404 (o painel nem "existe" para ele).
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") notFound();
  return user;
}

export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
