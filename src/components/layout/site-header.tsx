import Link from "next/link";
import { Search, ShoppingBag, UserRound } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { mainNav } from "@/lib/site";
import { MobileMenu } from "./mobile-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink-950/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="container-page flex h-16 items-center gap-6">
        <div className="flex items-center gap-2 lg:hidden">
          <MobileMenu />
        </div>
        <Link href="/" aria-label="Phantom Bio Labs home" className="shrink-0 max-lg:absolute max-lg:left-1/2 max-lg:-translate-x-1/2">
          <Logo />
        </Link>
        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-[13.5px] text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Link href="/shop" aria-label="Search the catalog" className="grid size-10 place-items-center rounded-xl text-muted transition-colors hover:bg-white/5 hover:text-foreground">
            <Search className="size-[18px]" />
          </Link>
          <Link href="/account" aria-label="Your account" className="hidden size-10 place-items-center rounded-xl text-muted transition-colors hover:bg-white/5 hover:text-foreground sm:grid">
            <UserRound className="size-[18px]" />
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative grid size-10 place-items-center rounded-xl text-foreground transition-colors hover:bg-white/5">
            <ShoppingBag className="size-[18px]" />
            <span className="absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full bg-violet-500 font-mono text-[9px] text-white">0</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
