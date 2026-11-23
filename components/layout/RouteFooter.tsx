"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function RouteFooter({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return /^\/work\/?$/.test(pathname) ? null : children;
}
