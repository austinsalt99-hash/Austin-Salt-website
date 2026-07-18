"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative flex flex-col-reverse items-center justify-center gap-4 overflow-hidden px-6 pb-16 pt-10 sm:flex-row sm:gap-0 sm:pt-16">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        className="relative z-10 shrink-0 text-center text-6xl font-extrabold tracking-tight text-brown-900 sm:-mr-16 sm:text-left sm:text-8xl md:text-9xl"
      >
        Austin
        <br />
        Salt
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative shrink-0"
      >
        <Image
          src="/images/hero/austin.png"
          alt="Austin Salt"
          width={360}
          height={480}
          priority
          className="mx-auto h-[260px] w-auto object-contain sm:h-[420px] md:h-[480px]"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, black 60%, transparent 100%), linear-gradient(to right, transparent 0%, black 25%)",
            WebkitMaskComposite: "source-in",
            maskImage:
              "linear-gradient(to bottom, black 60%, transparent 100%), linear-gradient(to right, transparent 0%, black 25%)",
            maskComposite: "intersect",
          }}
        />
      </motion.div>
    </section>
  );
}
