import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

interface StatCounterProps {
  end: number;
  duration?: number; // duration in ms
  prefix?: string;
  suffix?: string;
}

const StatCounter: React.FC<StatCounterProps> = ({
  end,
  duration = 1500,
  prefix = '',
  suffix = '',
}) => {
  const [count, setCount] = useState<number>(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.5 });
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (!isInView) return;

    if (reducedMotion) {
      setCount(end);
      return;
    }

    let start = 0;
    const startTime = performance.now();

    const updateCount = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      if (elapsedTime >= duration) {
        setCount(end);
        return;
      }

      // Easing function: quadratic ease-out
      const progress = elapsedTime / duration;
      const easedProgress = progress * (2 - progress);
      const nextCount = Math.floor(start + easedProgress * (end - start));
      
      setCount(nextCount);
      requestAnimationFrame(updateCount);
    };

    requestAnimationFrame(updateCount);
  }, [isInView, end, duration, reducedMotion]);

  return (
    <span ref={containerRef} className="font-display font-bold">
      {prefix}
      {count}
      {suffix}
    </span>
  );
};

export default StatCounter;
