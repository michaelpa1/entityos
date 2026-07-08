"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/identity", label: "Identity" },
  { href: "/assets", label: "Assets" },
  { href: "/claims", label: "Claims" },
  { href: "/evidence", label: "Evidence" },
  { href: "/search-snapshots", label: "Search Snapshots" },
  { href: "/ai-snapshots", label: "AI Snapshots" },
  { href: "/schema", label: "Schema" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/settings", label: "Settings" },
] as const;

function NavLink({
  href,
  label,
  onClick,
  className,
}: {
  href: string;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const active =
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {label}
    </Link>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop navigation */}
      <nav className="hidden items-center gap-0.5 xl:flex">
        {navLinks.map((link) => (
          <NavLink key={link.href} href={link.href} label={link.label} />
        ))}
        <ModeToggle />
      </nav>

      {/* Compact desktop (medium screens) — scrollable strip */}
      <nav className="hidden max-w-[52vw] items-center gap-0.5 overflow-x-auto md:flex xl:hidden">
        {navLinks.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            label={link.label}
            className="shrink-0 whitespace-nowrap text-xs"
          />
        ))}
        <ModeToggle />
      </nav>

      {/* Mobile menu button */}
      <div className="flex items-center gap-1 md:hidden">
        <ModeToggle />
        <Button
          variant="ghost"
          size="icon"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <XIcon /> : <MenuIcon />}
        </Button>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="absolute inset-x-0 top-14 border-b border-border/60 bg-background/95 backdrop-blur md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-0.5 px-4 py-3 sm:px-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                onClick={() => setOpen(false)}
                className="px-3 py-2"
              />
            ))}
          </nav>
        </div>
      ) : null}
    </>
  );
}
