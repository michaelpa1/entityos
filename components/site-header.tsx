import Link from "next/link";
import { BoxesIcon } from "lucide-react";

import { SiteNav } from "@/components/site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="relative mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold">
          <BoxesIcon className="size-5 text-primary" />
          <span className="hidden sm:inline">Entity OS</span>
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}
