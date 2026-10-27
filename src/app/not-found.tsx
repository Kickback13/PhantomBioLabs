import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GhostMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <GhostMark className="size-14 text-violet-400" />
      <p className="eyebrow mt-8">404 · Not found</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">This page vanished.</h1>
      <p className="mt-4 max-w-md text-muted">It may have moved, or it&apos;s still being built. The catalog is a good place to start.</p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/shop">
          Shop the catalog <ArrowRight />
        </Link>
      </Button>
    </section>
  );
}
