// Foto do usuário ou iniciais. `version` (updatedAt) quebra o cache quando a foto muda.
export function Avatar({ userId, name, version, size = 32, className = "" }: {
  userId: string; name: string | null; version?: Date | number | null; size?: number; className?: string;
}) {
  const initials = (name ?? "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  const style = { width: size, height: size };
  if (version) {
    // eslint-disable-next-line @next/next/no-img-element -- rota própria, já otimizada (256px webp)
    return <img src={`/avatar/${userId}?v=${+new Date(version)}`} alt="" width={size} height={size} style={style}
      className={`shrink-0 rounded-full border object-cover grayscale-[15%] ${className}`} />;
  }
  return (
    <span aria-hidden style={{ ...style, fontSize: size * 0.4 }}
      className={`grid shrink-0 place-items-center rounded-full border bg-secondary font-heading text-foreground ${className}`}>
      {initials}
    </span>
  );
}
