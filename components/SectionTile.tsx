"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function SectionTile({ href, label }: { href: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Link
        href={href}
        className="group relative flex h-56 items-end overflow-hidden rounded-2xl bg-gradient-to-br from-brown-600 to-brown-900 p-6 transition-transform duration-300 ease-out hover:scale-[1.03]"
      >
        <span className="text-2xl font-semibold text-cream">{label}</span>
      </Link>
    </motion.div>
  );
}
