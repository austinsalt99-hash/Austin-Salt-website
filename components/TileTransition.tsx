"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

type Rect = { top: number; left: number; width: number; height: number };
type Phase = "idle" | "growing" | "covering" | "leaving";
type Pending = { rect: Rect; label: string; href: string };

const GROW_DURATION = 0.4;
const LEAVE_DURATION = 0.35;

const TileTransitionContext = createContext<((pending: Pending) => void) | null>(null);

export function useTileTransition() {
  const begin = useContext(TileTransitionContext);
  if (!begin) throw new Error("useTileTransition must be used within TileTransitionProvider");
  return begin;
}

export function TileTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hasArrivedRef = useRef(false);
  const targetHrefRef = useRef<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  // Real arrival signal (route actually mounted), not a guessed timeout.
  useEffect(() => {
    if (phase === "covering" && targetHrefRef.current === pathname && !hasArrivedRef.current) {
      hasArrivedRef.current = true;
      setPhase("leaving");
    }
  }, [pathname, phase]);

  const begin = (next: Pending) => {
    hasArrivedRef.current = false;
    targetHrefRef.current = next.href;
    setPending(next);
    setPhase("growing");
    router.push(next.href);
  };

  return (
    <TileTransitionContext.Provider value={begin}>
      {children}
      {pending && phase !== "idle" && typeof document !== "undefined"
        ? createPortal(
            <motion.div
              className="fixed z-50 overflow-hidden bg-brown-900"
              initial={{
                top: pending.rect.top,
                left: pending.rect.left,
                width: pending.rect.width,
                height: pending.rect.height,
                borderRadius: 16,
                opacity: 1,
              }}
              animate={{
                top: 0,
                left: 0,
                width: window.innerWidth,
                height: window.innerHeight,
                borderRadius: 0,
                opacity: phase === "leaving" ? 0 : 1,
              }}
              transition={
                phase === "leaving"
                  ? { duration: LEAVE_DURATION, ease: "easeInOut" }
                  : { duration: GROW_DURATION, ease: [0.16, 1, 0.3, 1] }
              }
              onAnimationComplete={() => {
                if (phase === "growing") {
                  setPhase(hasArrivedRef.current ? "leaving" : "covering");
                } else if (phase === "leaving") {
                  setPhase("idle");
                  setPending(null);
                }
              }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === "leaving" ? 0 : 1 }}
                transition={{ duration: 0.25, delay: phase === "growing" ? GROW_DURATION * 0.6 : 0 }}
                className="absolute inset-0 flex items-center justify-center px-6 text-center text-3xl font-semibold text-cream sm:text-4xl"
              >
                {pending.label}
              </motion.span>
            </motion.div>,
            document.body,
          )
        : null}
    </TileTransitionContext.Provider>
  );
}
