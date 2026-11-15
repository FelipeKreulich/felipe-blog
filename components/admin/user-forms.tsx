"use client";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { adminSetPassword, adminUpdateUser, type AdminState } from "@/lib/admin-actions";
import { btnSolid, input, label } from "./ui";

// Submit manual (sem o reset automático do React 19 após a action, que apagaria o select/inputs).
function useManualSubmit(fn: (s: AdminState, fd: FormData) => Promise<AdminState>) {
  const [state, setState] = useState<AdminState>({});
  const [pending, start] = useTransition();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => setState(await fn(state, fd)));
  };
  return { state, pending, onSubmit };
}

function Status({ s }: { s: AdminState }) {
  return <p role="status" className={`min-h-5 font-mono text-[11px] uppercase tracking-wider ${s.error ? "text-accent" : "text-muted-foreground"}`}>{s.error ?? s.ok}</p>;
}

export function UserEditForm({ user, isSelf }: { user: { id: string; name: string; email: string; role: "ADMIN" | "READER" }; isSelf: boolean }) {
  const { state, pending, onSubmit } = useManualSubmit(adminUpdateUser);
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input type="hidden" name="id" value={user.id} />
      <label className="block space-y-1"><span className={label}>Nome</span><input name="name" defaultValue={user.name} required minLength={2} maxLength={60} className={input} /></label>
      <label className="block space-y-1"><span className={label}>E-mail</span><input name="email" type="email" defaultValue={user.email} required className={input} /></label>
      <label className="block space-y-1">
        <span className={label}>Cargo</span>
        <select name="role" defaultValue={user.role} disabled={isSelf} className={`${input} cursor-pointer`}>
          <option value="READER">Leitor</option>
          <option value="ADMIN">Admin</option>
        </select>
        {isSelf && <input type="hidden" name="role" value={user.role} />}
      </label>
      <p className="text-sm text-muted-foreground">Trocar o e-mail ou o cargo encerra as sessões abertas da pessoa.</p>
      <div className="flex items-center justify-between gap-4"><Status s={state} />
        <button disabled={pending} className={btnSolid}>{pending && <Loader2 className="size-3.5 animate-spin" />}Salvar</button>
      </div>
    </form>
  );
}

export function UserPasswordForm({ id }: { id: string }) {
  const { state, pending, onSubmit } = useManualSubmit(adminSetPassword);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <label className="block space-y-1">
        <span className={label}>Nova senha temporária</span>
        <input name="password" type="text" required minLength={8} maxLength={128} autoComplete="off" className={`${input} font-mono`} />
      </label>
      <p className="text-sm text-muted-foreground">Envie a senha à pessoa por um canal seguro e peça para ela trocá-la no perfil.</p>
      <div className="flex items-center justify-between gap-4"><Status s={state} />
        <button disabled={pending} className={btnSolid}>{pending && <Loader2 className="size-3.5 animate-spin" />}Definir senha</button>
      </div>
    </form>
  );
}
