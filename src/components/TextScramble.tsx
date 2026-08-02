import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

interface TextScrambleProps {
  text: string;
  className?: string;
  duration?: number; // duration in ms
  delay?: number; // delay in ms
  triggerOnce?: boolean;
}

const chars = '!@#$%^&*()_+-=[]{}|;:\'",.<>/?~X01';

const TextScramble: React.FC<TextScrambleProps> = ({
  text,
  className = '',
  duration = 800,
  delay = 0,
  triggerOnce = true,
}) => {
  const [displayText, setDisplayText] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: triggerOnce, amount: 0.5 });
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (!isInView) {
      setDisplayText('');
      return;
    }

    if (reducedMotion) {
      setDisplayText(text);
      return;
    }

    let isCancelled = false;
    
    const startTimeout = setTimeout(() => {
      let frame = 0;
      const totalFrames = Math.max(15, Math.floor(duration / 30));
      const textLength = text.length;

      const tick = () => {
        if (isCancelled) return;

        frame++;
        const progress = frame / totalFrames;

        // Number of characters to resolve
        const resolvedCount = Math.floor(progress * textLength);

        let scrambled = '';
        for (let i = 0; i < textLength; i++) {
          if (text[i] === ' ') {
            scrambled += ' ';
            continue;
          }

          if (i < resolvedCount) {
            scrambled += text[i];
          } else {
            // Pick a random scramble character
            scrambled += chars[Math.floor(Math.random() * chars.length)];
          }
        }

        setDisplayText(scrambled);

        if (frame < totalFrames) {
          requestAnimationFrame(tick);
        } else {
          setDisplayText(text);
        }
      };

      tick();
    }, delay);

    return () => {
      isCancelled = true;
      clearTimeout(startTimeout);
    };
  }, [isInView, text, duration, delay, reducedMotion]);

  return (
    <span ref={containerRef} className={className}>
      {displayText || (reducedMotion ? text : '')}
    </span>
  );
};

export default TextScramble;
