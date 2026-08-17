"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { href: "/projects", label: "Projects" },
  { href: "/achievements", label: "Achievements" },
  { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative px-6 py-4 sm:px-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-brown-900">
          Austin Salt
        </Link>

        <nav className="hidden items-center gap-1 rounded-full bg-beige p-1 sm:flex" aria-label="Primary">
          {SECTIONS.map((section) => (
            <PillLink key={section.href} href={section.href} active={isActive(pathname, section.href)}>
              {section.label}
            </PillLink>
          ))}
          <PillLink href="/contact" active={isActive(pathname, "/contact")} accent>
            Contact
          </PillLink>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center text-2xl leading-none text-brown-900 sm:hidden"
        >
          {open ? "×" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="mt-3 flex flex-col gap-1 rounded-3xl bg-beige p-2 sm:hidden" aria-label="Primary">
          {SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              onClick={() => setOpen(false)}
              className={
                isActive(pathname, section.href)
                  ? "rounded-full bg-brown-900 px-4 py-3 text-sm font-medium text-cream"
                  : "rounded-full px-4 py-3 text-sm font-medium text-brown-600"
              }
            >
              {section.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="rounded-full bg-accent px-4 py-3 text-center text-sm font-medium text-cream"
          >
            Contact
          </Link>
        </nav>
      )}
    </header>
  );
}

function PillLink({
  href,
  active,
  accent = false,
  children,
}: {
  href: string;
  active: boolean;
  accent?: boolean;
  children: React.ReactNode;
}) {
  const filled = active || accent;

  return (
    <Link
      href={href}
      className="group relative isolate overflow-hidden rounded-full px-5 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 origin-bottom rounded-full transition-transform duration-300 ease-out ${
          accent ? "bg-accent" : "bg-brown-900"
        } ${filled ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"}`}
      />
      <span
        className={`relative z-10 transition-colors duration-200 ${
          filled ? "text-cream" : "text-brown-600 group-hover:text-cream"
        }`}
      >
        {children}
      </span>
    </Link>
  );
}
