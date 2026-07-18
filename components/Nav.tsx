import Link from "next/link";

export function Nav() {
  return (
    <header className="flex items-center justify-between px-6 py-4 sm:px-10">
      <Link href="/" className="text-lg font-semibold text-brown-900">
        Austin Salt
      </Link>
      <Link
        href="/contact"
        className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-cream transition hover:opacity-90"
      >
        Contact
      </Link>
    </header>
  );
}
