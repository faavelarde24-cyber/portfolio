import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '../hooks/useReducedMotion';

type Props = {
  children: ReactNode;
  /** Seconds of stagger before this element starts. */
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'section' | 'article';
};

/**
 * A single micro-motion primitive: a short rise + fade, once, on entry.
 * Under prefers-reduced-motion it renders the element outright — no animation,
 * no opacity ramp, no layout difference.
 */
export function Reveal({ children, delay = 0, className, as = 'div' }: Props) {
  const reduced = usePrefersReducedMotion();
  const Tag = motion[as];

  if (reduced) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: [0.2, 0.7, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}
