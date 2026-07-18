"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function SectionTile({
  href,
  label,
  coverUrl,
}: {
  href: string;
  label: string;
  coverUrl?: string | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Link
        href={href}
        className="group relative flex h-56 items-end overflow-hidden rounded-2xl p-6 transition-transform duration-300 ease-out hover:scale-[1.03]"
        style={
          coverUrl
            ? { backgroundImage: `url(${coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      >
        <div
          className={
            coverUrl
              ? "absolute inset-0 bg-gradient-to-t from-brown-900/80 via-brown-900/20 to-transparent"
              : "absolute inset-0 bg-gradient-to-br from-brown-600 to-brown-900"
          }
        />
        <span className="relative text-2xl font-semibold text-cream">{label}</span>
      </Link>
    </motion.div>
  );
}
