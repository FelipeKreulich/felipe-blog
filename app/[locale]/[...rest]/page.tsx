import { notFound } from "next/navigation";

// Qualquer rota desconhecida dentro de /[locale] cai no not-found traduzido.
export default function CatchAll() {
  notFound();
}
