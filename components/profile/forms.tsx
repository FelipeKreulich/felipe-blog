"use client";
import { useActionState, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Camera, Loader2 } from "lucide-react";
import { Field, submitClass } from "@/components/auth/auth-shell";
import { changePassword, deleteAccount, removeAvatar, updateName, uploadAvatar, type ProfileState } from "@/lib/profile-actions";

function Status({ s }: { s: ProfileState }) {
  return (
    <p role="status" aria-live="polite"
      className={`min-h-5 font-mono text-[11px] uppercase tracking-wider ${s.error ? "text-accent" : "text-muted-foreground"}`}>
      {s.error ?? s.ok}
    </p>
  );
}

function Submit({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button type="submit" disabled={pending} className={`${submitClass} sm:w-auto`}>
      {pending && <Loader2 className="size-3.5 animate-spin" />}{label}
    </button>
  );
}

export function NameForm({ name }: { name: string }) {
  const t = useTranslations("profile");
  const [s, action, pending] = useActionState<ProfileState, FormData>(updateName, {});
  return (
    <form action={action} className="space-y-4">
      <Field label={t("name")} name="name" defaultValue={name} required minLength={2} maxLength={60} autoComplete="name" />
      <div className="flex items-center justify-between gap-4"><Status s={s} /><Submit pending={pending} label={t("save")} /></div>
    </form>
  );
}

export function PasswordForm() {
  const t = useTranslations("profile");
  const [s, action, pending] = useActionState<ProfileState, FormData>(changePassword, {});
  return (
    <form action={action} className="space-y-4">
      <Field label={t("currentPassword")} name="current" type="password" required autoComplete="current-password" />
      <Field label={t("newPassword")} name="next" type="password" required minLength={8} maxLength={128} autoComplete="new-password" />
      <Field label={t("confirmPassword")} name="confirm" type="password" required minLength={8} maxLength={128} autoComplete="new-password" />
      <div className="flex items-center justify-between gap-4"><Status s={s} /><Submit pending={pending} label={t("changePassword")} /></div>
    </form>
  );
}

// Recorta no centro e reduz para 256x256 WebP no navegador: upload pequeno, sem lib.
async function toSquareWebp(file: File, size = 256): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const side = Math.min(bmp.width, bmp.height);
  const canvas = Object.assign(document.createElement("canvas"), { width: size, height: size });
  canvas.getContext("2d")!.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, size, size);
  bmp.close();
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode"))), "image/webp", 0.85));
}

export function AvatarForm({ preview, hasAvatar }: { preview: React.ReactNode; hasAvatar: boolean }) {
  const t = useTranslations("profile");
  const input = useRef<HTMLInputElement>(null);
  const [s, setS] = useState<ProfileState>({});
  const [pending, start] = useTransition();

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    start(async () => {
      try {
        const fd = new FormData();
        fd.set("avatar", new File([await toSquareWebp(file)], "avatar.webp", { type: "image/webp" }));
        setS(await uploadAvatar({}, fd));
      } catch {
        setS({ error: t("badFile") });
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative">
        {preview}
        {pending && <span className="absolute inset-0 grid place-items-center rounded-full bg-background/70"><Loader2 className="size-5 animate-spin" /></span>}
      </div>
      <div className="space-y-3">
        <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={onPick} aria-label={t("changePhoto")} />
        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={pending} onClick={() => input.current?.click()}
            className="inline-flex items-center gap-2 border border-foreground px-4 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background disabled:opacity-50">
            <Camera className="size-3.5" /> {t("changePhoto")}
          </button>
          {hasAvatar && (
            <button type="button" disabled={pending} onClick={() => start(async () => { await removeAvatar(); setS({ ok: t("avatarRemoved") }); })}
              className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-accent disabled:opacity-50">
              {t("removePhoto")}
            </button>
          )}
        </div>
        <p className="font-mono text-[11px] text-muted-foreground">{t("photoHint")}</p>
        <Status s={s} />
      </div>
    </div>
  );
}

export function DeleteAccountForm() {
  const t = useTranslations("profile");
  const [s, action, pending] = useActionState<ProfileState, FormData>(deleteAccount, {});
  return (
    <form action={action} className="space-y-4 border border-accent/50 p-5">
      <p className="text-sm leading-relaxed text-muted-foreground">{t("deleteWarning")}</p>
      <Field label={t("currentPassword")} name="password" type="password" required autoComplete="current-password" />
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="confirm" required className="mt-1 accent-[var(--accent)]" />
        <span>{t("deleteConfirm")}</span>
      </label>
      <div className="flex items-center justify-between gap-4">
        <Status s={s} />
        <button type="submit" disabled={pending}
          className="inline-flex items-center gap-2 bg-accent px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
          {pending && <Loader2 className="size-3.5 animate-spin" />}{t("deleteCta")}
        </button>
      </div>
    </form>
  );
}
