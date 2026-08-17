import Link from "next/link";

const INCLUDED = [
  "Custom design tailored to your brand — not a template with your logo dropped in",
  "Fully responsive, fast-loading pages on modern, reliable tools",
  "A simple admin dashboard so you can update content yourself, no code required",
  "Support after launch as your site grows or changes",
];

export default function WebDesignPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-brown-900">Website Design</h1>
      <p className="mt-4 text-lg text-brown-600">
        I design and build custom websites — like this one — for small businesses, creators, and personal
        brands who want something that looks considered, loads fast, and doesn&apos;t fight them to update.
      </p>

      <div className="mt-10">
        <h2 className="text-sm font-medium uppercase tracking-wide text-brown-600">What&apos;s included</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {INCLUDED.map((item) => (
            <li key={item} className="flex gap-3 text-brown-900">
              <span aria-hidden className="mt-1 text-accent">
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12 rounded-2xl border border-stone-500/30 bg-beige p-8">
        <p className="text-brown-900">Have a project in mind?</p>
        <p className="mt-1 text-brown-600">Tell me a bit about it and I&apos;ll get back to you.</p>
        <Link
          href="/contact"
          className="mt-5 inline-block rounded-full bg-accent px-5 py-2 font-medium text-cream transition hover:opacity-90"
        >
          Get in touch
        </Link>
      </div>
    </main>
  );
}
