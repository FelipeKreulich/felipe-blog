import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/routing";
import { signOutAction } from "@/lib/auth-actions";

export async function UserMenu() {
  const session = await auth();
  const t = await getTranslations();
  if (!session?.user) {
    return <Link href="/signin" className="transition-colors hover:text-foreground">{t("nav.signIn")}</Link>;
  }
  return (
    <div className="flex items-center gap-3">
      <span className="max-w-32 truncate text-foreground">{session.user.name ?? session.user.email}</span>
      <form action={signOutAction}>
        <button type="submit" className="uppercase transition-colors hover:text-accent">{t("auth.signOut")}</button>
      </form>
    </div>
  );
}
