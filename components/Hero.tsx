"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";

const NAME_LINES = ["Austin", "Salt"];

const nameContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.035, delayChildren: 0.1 },
  },
};

const nameLetter: Variants = {
  hidden: { opacity: 0, y: 36, rotate: -6, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Hero() {
  return (
    <section className="relative flex min-h-[100dvh] flex-col-reverse items-center justify-center gap-4 overflow-hidden px-6 py-16 sm:flex-row sm:gap-0">
      <motion.h1
        initial="hidden"
        animate="visible"
        variants={nameContainer}
        className="relative z-10 shrink-0 text-center font-extrabold leading-[0.9] tracking-tight text-brown-900 sm:-mr-16 sm:text-left"
        style={{ fontSize: "clamp(4.5rem, 16vw, 15rem)" }}
      >
        {NAME_LINES.map((line) => (
          <span key={line} className="block">
            {line.split("").map((char, charIndex) => (
              <motion.span key={`${line}-${charIndex}`} variants={nameLetter} className="inline-block">
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
        className="relative shrink-0"
      >
        <Image
          src="/images/hero/austin-portrait-2.png"
          alt="Austin Salt"
          width={1064}
          height={1517}
          priority
          className="mx-auto h-[340px] w-auto object-contain sm:h-[540px] md:h-[640px] lg:h-[720px]"
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
