import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section className="text-center">
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Page not found</h1>
        <p className="mt-3 text-muted-foreground">The requested page does not exist.</p>
        <Link className="mt-6 inline-flex text-primary underline-offset-4 hover:underline" href="/">
          Return home
        </Link>
      </section>
    </main>
  );
}
