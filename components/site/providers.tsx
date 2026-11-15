"use client";
import { ReactLenis } from "lenis/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ReactLenis root options={{ lerp: 0.1, smoothWheel: true }}>{children}</ReactLenis>;
}
