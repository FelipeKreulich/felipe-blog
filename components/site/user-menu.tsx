import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/current-user";
import { Link } from "@/i18n/routing";
import { signOutAction } from "@/lib/auth-actions";
import { Avatar } from "./avatar";

export async function UserMenu() {
  const [user, t] = await Promise.all([getCurrentUser(), getTranslations()]);

  if (!user) {
    return <Link href="/signin" className="transition-colors hover:text-foreground">{t("nav.signIn")}</Link>;
  }
  return (
    <div className="flex items-center gap-3">
      <Link href="/profile" title={t("nav.profile")} className="group flex items-center gap-2 text-foreground">
        <Avatar userId={user.id} name={user.name} version={user.avatar?.updatedAt} size={22} />
        <span className="hidden max-w-32 truncate underline-offset-4 group-hover:underline sm:inline">{user.name ?? user.email}</span>
      </Link>
      <form action={signOutAction}>
        <button type="submit" className="uppercase transition-colors hover:text-accent">{t("auth.signOut")}</button>
      </form>
    </div>
  );
}
