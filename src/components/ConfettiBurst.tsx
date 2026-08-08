import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiBurstProps {
  /** True for the brief window a quest just completed — see ThesisQuests.tsx's `isNew`. */
  active: boolean;
  /** A bigger, longer burst for the all-quests-done moment. */
  big?: boolean;
}

const COLORS = ["bg-primary", "bg-accent", "bg-yellow-400", "bg-pink-400", "bg-emerald-400"];

// Framer-motion-only celebration burst — no confetti library exists in this
// project, and framer-motion (already a dependency everywhere else in this
// file's parent) is enough for a handful of particles. Meant to be dropped
// inside a `relative` wrapper (e.g. a quest's icon circle container); it
// positions itself absolutely and spawns particles from the center outward.
const ConfettiBurst = ({ active, big = false }: ConfettiBurstProps) => {
  const count = big ? 18 : 9;

  // Random offsets are frozen per activation (not recomputed on every
  // render while `active` stays true) — otherwise a parent re-render mid-
  // burst would reroll the targets and make particles visibly jump.
  const particles = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * 2 * Math.PI + Math.random() * 0.5;
      const distance = (big ? 55 : 32) + Math.random() * (big ? 35 : 18);
      return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        color: COLORS[i % COLORS.length],
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
      <AnimatePresence>
        {particles.map((p, i) => (
          <motion.span
            key={i}
            className={`absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full ${p.color}`}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: big ? 0.9 : 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ConfettiBurst;
