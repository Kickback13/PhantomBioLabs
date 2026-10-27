"use client";

// Adapted from 21st.dev "Tilt" (ibelick / Motion Primitives): the element tilts in 3D toward the
// mouse. Mouse only, so touch scrolling is untouched, and off for reduced-motion visitors.
import { useRef, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform, type SpringOptions } from "motion/react";

export function Tilt({
  children,
  className,
  rotationFactor = 8,
  reverse = false,
  springOptions = { stiffness: 160, damping: 18, mass: 0.4 },
}: {
  children: ReactNode;
  className?: string;
  rotationFactor?: number;
  reverse?: boolean;
  springOptions?: SpringOptions;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, springOptions);
  const ySpring = useSpring(y, springOptions);
  const sign = reverse ? -1 : 1;
  const rotateX = useTransform(ySpring, [-0.5, 0.5], [sign * rotationFactor, -sign * rotationFactor]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-sign * rotationFactor, sign * rotationFactor]);
  const transform = useMotionTemplate`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ transformStyle: "preserve-3d", transform }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
