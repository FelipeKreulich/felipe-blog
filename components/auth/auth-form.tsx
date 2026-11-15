"use client";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { signInAction, signUpAction, type AuthState } from "@/lib/auth-actions";
import { Field, submitClass } from "./auth-shell";

export function AuthForm({ mode, next }: { mode: "signin" | "signup"; next: string }) {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "signin" ? signInAction : signUpAction, {});

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="next" value={next} />
      {mode === "signup" && <Field label={t("name")} name="name" defaultValue={state.name} key={`n${state.error}`} required minLength={2} maxLength={60} autoComplete="name" />}
      <Field label={t("email")} name="email" type="email" defaultValue={state.email} key={`e${state.error}`} required autoComplete="email" />
      <Field label={t("password")} name="password" type="password" required minLength={8} maxLength={128}
        autoComplete={mode === "signin" ? "current-password" : "new-password"} />
      {mode === "signup" && <p className="-mt-3 font-mono text-[11px] text-muted-foreground">{t("passwordHint")}</p>}
      <p role="alert" aria-live="polite" className="min-h-5 font-mono text-[11px] uppercase tracking-wider text-accent">{state.error}</p>
      <button type="submit" disabled={pending} className={submitClass}>
        {pending && <Loader2 className="size-3.5 animate-spin" />}
        {mode === "signin" ? t("signInCta") : t("signUpCta")}
      </button>
    </form>
  );
}
