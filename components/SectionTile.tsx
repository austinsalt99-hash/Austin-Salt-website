"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTileTransition } from "@/components/TileTransition";

export function SectionTile({
  href,
  label,
  coverUrl,
  index = 0,
}: {
  href: string;
  label: string;
  coverUrl?: string | null;
  index?: number;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const beginTransition = useTileTransition();

  const handleNavigate = (event: { preventDefault: () => void }) => {
    const box = linkRef.current?.getBoundingClientRect();
    if (!box) return;
    event.preventDefault();
    beginTransition({
      href,
      label,
      rect: { top: box.top, left: box.left, width: box.width, height: box.height },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, delay: index * 0.12, ease: "easeOut" }}
    >
      <Link
        ref={linkRef}
        href={href}
        onNavigate={handleNavigate}
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
        <span className="relative z-10 text-2xl font-semibold text-cream">{label}</span>
      </Link>
    </motion.div>
  );
}
