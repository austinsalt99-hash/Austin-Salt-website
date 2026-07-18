"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative flex flex-col items-center overflow-hidden px-6 pb-16 pt-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        <Image
          src="/images/hero/austin.png"
          alt="Austin Salt"
          width={360}
          height={480}
          priority
          className="mx-auto h-[320px] w-auto object-contain sm:h-[420px]"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
          }}
        />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        className="mt-4 text-4xl font-semibold text-brown-900 sm:text-5xl"
      >
        Austin Salt
      </motion.h1>
    </section>
  );
}
