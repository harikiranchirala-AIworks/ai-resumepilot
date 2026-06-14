import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import logoAsset from "@/assets/ats-resume-ready-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export function SiteHeader() {
  return (
    <header className="border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5" aria-label="ATS Resume Ready home">
          <img
            src={logoAsset.url}
            alt="ATS Resume Ready logo"
            className="h-9 w-9 rounded-xl shadow-logo"
            width={36}
            height={36}
          />
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            ATS Resume Ready
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <Link
            to="/about"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            About
          </Link>
          <Link
            to="/how-it-works"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            How it works
          </Link>
        </nav>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button asChild size="sm">
            <Link to="/workspace">
              Open workspace <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
