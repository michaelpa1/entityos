import Link from "next/link";
import { BoxesIcon } from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BoxesIcon className="size-5 text-primary" />
          <span>Entity OS</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/identity"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Identity
          </Link>
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
