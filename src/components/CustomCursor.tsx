import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import sound from '../utils/sound';

const CustomCursor: React.FC = () => {
  const [isTouch, setIsTouch] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Raw mouse coordinates
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Physics config for trailing ring spring-lag
  const springConfig = reducedMotion
    ? { damping: 100, stiffness: 1000 }
    : { damping: 25, stiffness: 220, mass: 0.5 };

  const ringX = useSpring(mouseX, springConfig);
  const ringY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Check if device supports touch input
    const checkTouch = () => {
      const touchCapable =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches;
      setIsTouch(touchCapable);
    };

    // Respect reduced motion accessibility setting
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    checkTouch();
    window.addEventListener('resize', checkTouch);

    if (isTouch) return;

    // Pointer event listeners
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Dynamic hover affordance on interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const interactive = target.closest(
        'a, button, [role="button"], input, select, textarea, .interactive-card, .clickable, [data-cursor="hover"]'
      ) as HTMLElement | null;

      if (interactive) {
        setIsHovered(true);
        if (!interactive.dataset.hasHoverSound) {
          interactive.dataset.hasHoverSound = 'true';
          interactive.addEventListener('mouseenter', () => {
            sound.playHover();
          });
        }
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('resize', checkTouch);
      motionQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isTouch, isVisible, mouseX, mouseY]);

  if (isTouch) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden">
      {/* Outer Soft Outlined Ring (~32px base) with Spring-Lag */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border pointer-events-none"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovered ? 1.75 : 1,
          opacity: isVisible ? (isHovered ? 0.9 : 0.45) : 0,
          backgroundColor: isHovered ? 'rgba(255, 123, 0, 0.12)' : 'rgba(255, 123, 0, 0.02)',
          borderColor: isHovered ? '#ff8800' : 'rgba(255, 136, 0, 0.45)',
          boxShadow: isHovered
            ? '0 0 20px rgba(255, 123, 0, 0.5), inset 0 0 10px rgba(255, 123, 0, 0.2)'
            : '0 0 8px rgba(255, 123, 0, 0.15)',
        }}
        transition={{
          scale: { type: 'spring', stiffness: 350, damping: 25 },
          opacity: { duration: 0.15 },
          backgroundColor: { duration: 0.2 },
          borderColor: { duration: 0.2 },
        }}
      />

      {/* Inner Glowing Dot (~10px base) */}
      <motion.div
        className="fixed top-0 left-0 w-2.5 h-2.5 rounded-full pointer-events-none"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
          background: 'linear-gradient(135deg, #ff7b00 0%, #ffd000 100%)',
          boxShadow: '0 0 10px #ff7b00, 0 0 4px #ffd000',
        }}
        animate={{
          scale: isPressed ? 0.65 : isHovered ? 1.25 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          scale: { type: 'spring', stiffness: 500, damping: 20 },
          opacity: { duration: 0.15 },
        }}
      />
    </div>
  );
};

export default CustomCursor;
