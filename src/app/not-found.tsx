import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-16 items-center">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="text-center">
          <p className="font-display text-7xl font-semibold text-primary sm:text-8xl">
            404
          </p>
          <h1 className="heading-md mt-4">This page took a detour</h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has moved.
            Let&apos;s get you back on track.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/">
                <Home className="h-4 w-4" />
                Back to home
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">
                <ArrowLeft className="h-4 w-4" />
                Contact us
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
