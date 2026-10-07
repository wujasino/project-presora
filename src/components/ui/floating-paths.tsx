import React, { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Paths are computed once (outside component) — never recalculated on re-render.
// 18 paths instead of 36: visually identical at half the GPU cost.
const buildPaths = (position: number) =>
  Array.from({ length: 18 }, (_, i) => {
    const j = i * 2; // keep same visual spread as original 36
    return {
      id: j,
      d: `M-${380 - j * 5 * position} -${189 + j * 6}C-${
        380 - j * 5 * position
      } -${189 + j * 6} -${312 - j * 5 * position} ${216 - j * 6} ${
        152 - j * 5 * position
      } ${343 - j * 6}C${616 - j * 5 * position} ${470 - j * 6} ${
        684 - j * 5 * position
      } ${875 - j * 6} ${684 - j * 5 * position} ${875 - j * 6}`,
      width: 0.5 + j * 0.03,
      opacity: 0.1 + j * 0.03,
      duration: 20 + (j * 0.7) % 10,
    };
  });

// Cache per position value to avoid rebuilding when parent re-renders
const pathCache = new Map<number, ReturnType<typeof buildPaths>>();
const getPaths = (position: number) => {
  if (!pathCache.has(position)) pathCache.set(position, buildPaths(position));
  return pathCache.get(position)!;
};

export const FloatingPathsBackground = memo(function FloatingPathsBackground({
  position,
  children,
  className,
  id,
}: {
  position: number;
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  const paths = getPaths(position);

  return (
    <div id={id} className={cn("w-full relative", className)}>
      <div
        className="absolute inset-0 -z-10 pointer-events-none overflow-hidden"
        style={{ willChange: 'auto' }}
      >
        <svg
          className="w-full h-full text-slate-950 dark:text-white"
          viewBox="0 0 696 316"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {paths.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="currentColor"
              strokeWidth={path.width}
              strokeOpacity={path.opacity}
              initial={{ pathLength: 0.3, opacity: 0.6 }}
              animate={{
                pathLength: 1,
                opacity: [0.3, 0.6, 0.3],
                pathOffset: [0, 1, 0],
              }}
              transition={{
                duration: path.duration,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </svg>
      </div>
      {children}
    </div>
  );
});
