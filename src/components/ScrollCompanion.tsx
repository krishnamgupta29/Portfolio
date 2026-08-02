import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { COMPANION_MESSAGES, GENERIC_PLAYFUL_MESSAGES } from '../data/companionMessages';

interface ScrollCompanionProps {
  heroElementId?: string;
}

const SECTION_ORDER = [
  'hero',
  'about',
  'skills',
  'hackathons',
  'projects',
  'certificates',
  'arcade',
  'devnotes',
  'guestbook',
  'contact',
];

export const ScrollCompanion: React.FC<ScrollCompanionProps> = ({ heroElementId = 'hero' }) => {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isCompanionMode, setIsCompanionMode] = useState<boolean>(false);
  const [peekSide, setPeekSide] = useState<'left' | 'right'>('right');
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Pupil eye-tracking coords
  const [pupilOffset, setPupilOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const faceRef = useRef<HTMLDivElement>(null);

  // Speech bubble state & pacing
  const [speechBubble, setSpeechBubble] = useState<{ visible: boolean; text: string } | null>(null);
  const visitedSectionBubbles = useRef<Set<string>>(new Set());
  const recentMessageIndices = useRef<Record<string, number[]>>({});
  const lastBubbleDismissTime = useRef<number>(0);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { scrollY } = useScroll();

  // Smooth scroll transform values for transition out of hero
  const scrollTransformY = useTransform(scrollY, [0, 400], [0, 60]);

  // 1. Device and preference detection
  useEffect(() => {
    const checkTouch = () => {
      const isTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches;
      setIsTouchDevice(isTouch);
    };

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    checkTouch();
    window.addEventListener('resize', checkTouch);

    return () => {
      window.removeEventListener('resize', checkTouch);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // 2. Mouse tracking for face pupils
  useEffect(() => {
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!faceRef.current) return;
      const rect = faceRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);

      const maxRadius = isCompanionMode ? 5 : 10;
      const factor = dist === 0 ? 0 : Math.min(dist, 300) / 300;

      const angle = Math.atan2(dy, dx);
      setPupilOffset({
        x: Math.cos(angle) * maxRadius * factor,
        y: Math.sin(angle) * maxRadius * factor,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isCompanionMode, isTouchDevice]);

  // 3. Periodic eye blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3800 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // 4. Scroll position and active section observer
  useEffect(() => {
    const handleScroll = () => {
      const heroEl = document.getElementById(heroElementId);
      if (heroEl) {
        const heroBottom = heroEl.getBoundingClientRect().bottom;
        const pastHero = heroBottom < window.innerHeight * 0.45;
        setIsCompanionMode(pastHero);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Section Intersection Observer
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const rawId = entry.target.id.replace('-section', '');
          setActiveSection(rawId);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.35,
    });

    SECTION_ORDER.forEach((sec) => {
      const el = document.getElementById(`${sec}-section`) || document.getElementById(sec);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [heroElementId]);

  // 5. Side-switching on section change
  useEffect(() => {
    const secIndex = SECTION_ORDER.indexOf(activeSection);
    if (secIndex !== -1) {
      // Alternate left / right based on section index
      const newSide = secIndex % 2 === 1 ? 'left' : 'right';
      setPeekSide(newSide);
    }
  }, [activeSection]);

  // 6. Speech Bubble Triggering Engine (Pacing, Dwell, Cooldown, Anti-Repetition)
  useEffect(() => {
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current);
    }

    // Don't trigger if already visited in this pass
    if (visitedSectionBubbles.current.has(activeSection)) return;

    // Set a 1.2 second dwell timer to ensure the user actually settled on this section
    dwellTimerRef.current = setTimeout(() => {
      const now = Date.now();
      // Check global 7-second cooldown since last bubble dismissed
      if (now - lastBubbleDismissTime.current < 7000) return;

      // Select message pool
      let pool = COMPANION_MESSAGES[activeSection] || COMPANION_MESSAGES['hero'];
      
      // 1 in 10 chance to pick a generic playful easter egg
      if (Math.random() < 0.1) {
        pool = GENERIC_PLAYFUL_MESSAGES;
      }

      const secKey = pool === GENERIC_PLAYFUL_MESSAGES ? 'generic' : activeSection;
      const history = recentMessageIndices.current[secKey] || [];

      // Find indices not in recent history
      const availableIndices = pool
        .map((_, idx) => idx)
        .filter((idx) => !history.includes(idx));

      const chosenIdx =
        availableIndices.length > 0
          ? availableIndices[Math.floor(Math.random() * availableIndices.length)]
          : Math.floor(Math.random() * pool.length);

      // Update history (keep max 4)
      const updatedHistory = [...history, chosenIdx].slice(-4);
      recentMessageIndices.current[secKey] = updatedHistory;

      // Mark section visited for bubble trigger
      visitedSectionBubbles.current.add(activeSection);

      // Show speech bubble
      setSpeechBubble({ visible: true, text: pool[chosenIdx] });

      // Dismiss bubble after 3.5 seconds
      setTimeout(() => {
        setSpeechBubble(null);
        lastBubbleDismissTime.current = Date.now();
      }, 3500);
    }, 1200);

    return () => {
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    };
  }, [activeSection]);

  // Render SVG Robot Companion Face
  const renderRobotFace = (size: 'large' | 'companion') => {
    const isLarge = size === 'large';
    const scaleFactor = isLarge ? 1 : 0.45;

    return (
      <div
        ref={faceRef}
        className="relative flex items-center justify-center select-none"
        style={{
          width: isLarge ? 220 : 96,
          height: isLarge ? 220 : 96,
        }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_0_20px_rgba(255,123,0,0.45)]"
        >
          <defs>
            <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a1816" />
              <stop offset="50%" stopColor="#0d0c0b" />
              <stop offset="100%" stopColor="#050505" />
            </linearGradient>

            <linearGradient id="visorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#000000" />
              <stop offset="100%" stopColor="#120c08" />
            </linearGradient>

            <linearGradient id="glowBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff7b00" />
              <stop offset="50%" stopColor="#ffd000" />
              <stop offset="100%" stopColor="#ff7b00" />
            </linearGradient>

            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Antenna */}
          <line
            x1="100"
            y1="35"
            x2="100"
            y2="12"
            stroke="#ff7b00"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle
            cx="100"
            cy="10"
            r="6.5"
            fill="#ffd000"
            filter="url(#neonGlow)"
            className="animate-pulse"
          />

          {/* Ears */}
          <rect x="18" y="80" width="10" height="30" rx="4" fill="#ff7b00" opacity="0.8" />
          <rect x="172" y="80" width="10" height="30" rx="4" fill="#ff7b00" opacity="0.8" />

          {/* Outer Head Chassis */}
          <rect
            x="26"
            y="36"
            width="148"
            height="128"
            rx="32"
            fill="url(#headGrad)"
            stroke="url(#glowBorder)"
            strokeWidth="3.5"
          />

          {/* Inner Visor Display */}
          <rect
            x="38"
            y="48"
            width="124"
            height="104"
            rx="24"
            fill="url(#visorGrad)"
            stroke="rgba(255, 123, 0, 0.4)"
            strokeWidth="1.5"
          />

          {/* Left Eye Socket */}
          <circle cx="72" cy="92" r="22" fill="#080808" stroke="#ff7b00" strokeWidth="1.5" />
          {/* Right Eye Socket */}
          <circle cx="128" cy="92" r="22" fill="#080808" stroke="#ff7b00" strokeWidth="1.5" />

          {/* Eyes (Blinking or Pupil tracking) */}
          {isBlinking ? (
            <>
              <line x1="58" y1="92" x2="86" y2="92" stroke="#ffd000" strokeWidth="4" strokeLinecap="round" />
              <line x1="114" y1="92" x2="142" y2="92" stroke="#ffd000" strokeWidth="4" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Left Eye Pupil */}
              <circle
                cx={72 + pupilOffset.x * scaleFactor}
                cy={92 + pupilOffset.y * scaleFactor}
                r="11"
                fill="#ff7b00"
                filter="url(#neonGlow)"
              />
              <circle
                cx={72 + pupilOffset.x * scaleFactor + 3}
                cy={92 + pupilOffset.y * scaleFactor - 3}
                r="3.5"
                fill="#ffffff"
              />

              {/* Right Eye Pupil */}
              <circle
                cx={128 + pupilOffset.x * scaleFactor}
                cy={92 + pupilOffset.y * scaleFactor}
                r="11"
                fill="#ff7b00"
                filter="url(#neonGlow)"
              />
              <circle
                cx={128 + pupilOffset.x * scaleFactor + 3}
                cy={92 + pupilOffset.y * scaleFactor - 3}
                r="3.5"
                fill="#ffffff"
              />
            </>
          )}

          {/* Cheerful Digital Mouth Line */}
          <path
            d="M 74 130 Q 100 144 126 130"
            fill="none"
            stroke="#ffd000"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Subtle Cheek Glow Dots */}
          <circle cx="52" cy="118" r="4" fill="#ff7b00" opacity="0.4" />
          <circle cx="148" cy="118" r="4" fill="#ff7b00" opacity="0.4" />
        </svg>
      </div>
    );
  };

  return (
    <>
      {/* 1. Hero Mode Render Stage (Inline right hero layout when Y = 0) */}
      <AnimatePresence>
        {!isCompanionMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.5 }}
            style={{ y: scrollTransformY }}
            className="relative flex items-center justify-center p-4"
          >
            {/* Idle floating animation */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {renderRobotFace('large')}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Scroll Companion Mode (Fixed edge peeking when past Hero) */}
      <AnimatePresence>
        {isCompanionMode && (
          <motion.div
            initial={{
              x: peekSide === 'left' ? -120 : 120,
              opacity: 0,
            }}
            animate={{
              x: 0,
              opacity: 1,
              rotate: reducedMotion ? 0 : peekSide === 'left' ? -10 : 10,
            }}
            exit={{
              x: peekSide === 'left' ? -120 : 120,
              opacity: 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 22,
            }}
            className={`fixed z-[9990] pointer-events-none flex items-center gap-3 ${
              isTouchDevice
                ? 'bottom-6 left-4'
                : peekSide === 'left'
                ? 'top-[42%] left-0 -ml-3 flex-row'
                : 'top-[42%] right-0 -mr-3 flex-row-reverse'
            }`}
          >
            {/* Peeking Face Wrapper */}
            <motion.div
              animate={reducedMotion ? {} : { y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-auto cursor-pointer"
              onClick={() => {
                // Click reaction: trigger instant blink & playful speech bubble
                setIsBlinking(true);
                setTimeout(() => setIsBlinking(false), 250);
                const randomGeneric =
                  GENERIC_PLAYFUL_MESSAGES[
                    Math.floor(Math.random() * GENERIC_PLAYFUL_MESSAGES.length)
                  ];
                setSpeechBubble({ visible: true, text: randomGeneric });
                setTimeout(() => setSpeechBubble(null), 3500);
              }}
            >
              {renderRobotFace('companion')}
            </motion.div>

            {/* Contextual Speech Bubble */}
            <AnimatePresence>
              {speechBubble?.visible && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="pointer-events-none relative z-50 max-w-[220px] rounded-2xl bg-black/85 dark:bg-black/85 backdrop-blur-xl border border-harvest-orange/40 p-3.5 shadow-[0_0_25px_rgba(255,123,0,0.3)] text-white text-xs font-sans leading-relaxed"
                >
                  {/* Bubble Pointer Tail */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent ${
                      peekSide === 'left'
                        ? '-left-2 border-r-[8px] border-r-harvest-orange/40'
                        : '-right-2 border-l-[8px] border-l-harvest-orange/40'
                    }`}
                  />
                  <p className="m-0 font-medium text-white/95">{speechBubble.text}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ScrollCompanion;
