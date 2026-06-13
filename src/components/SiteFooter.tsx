import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/25">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p>© {new Date().getFullYear()} ResumePilot. Tailor honestly. Apply confidently.</p>
        <nav className="flex gap-5" aria-label="Footer navigation">
          <Link to="/about" className="hover:text-foreground">About</Link>
          <Link to="/how-it-works" className="hover:text-foreground">How it works</Link>
          <Link to="/workspace" className="hover:text-foreground">Workspace</Link>
        </nav>
      </div>
    </footer>
  );
}