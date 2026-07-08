import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/60 bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-center text-xs text-muted-foreground sm:flex-row sm:px-6 sm:text-left">
        <p>Entity OS &copy; {year} — private entity authority dashboard.</p>
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="transition-colors hover:text-foreground"
          >
            Settings
          </Link>
          <Link href="/" className="transition-colors hover:text-foreground">
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}
