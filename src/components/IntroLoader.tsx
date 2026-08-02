import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroLoaderProps {
  onComplete: () => void;
}

const IntroLoader: React.FC<IntroLoaderProps> = ({ onComplete }) => {
  const [loadingText, setLoadingText] = useState<string>('0%');
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      onComplete();
      setIsVisible(false);
      return;
    }

    // Progress counter animation
    let count = 0;
    const interval = setInterval(() => {
      count += Math.floor(Math.random() * 8) + 2;
      if (count >= 100) {
        count = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsExploded(true);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 300);
          }, 600); // Wait for explosion animation to finish
        }, 300);
      }
      setLoadingText(`${count}%`);
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete, reducedMotion]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="fixed inset-0 w-full h-full bg-[#060606] flex flex-col items-center justify-center z-[9999]"
      >
        <div className="relative flex flex-col items-center justify-center">
          {/* Hexagon/Circle Logo container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`relative w-28 h-28 flex items-center justify-center transition-all duration-500 ${
              isExploded ? 'scale-[2.5] blur-md opacity-0' : ''
            }`}
          >
            {/* SVG Logo drawing */}
            <svg
              className="w-full h-full text-harvest-orange"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Hexagon */}
              <motion.polygon
                points="50,3 93,25 93,75 50,97 7,75 7,25"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
              />
              {/* Inner Glowing Ring */}
              <motion.circle
                cx="50"
                cy="50"
                r="30"
                stroke="#ffd000"
                strokeWidth="1"
                strokeDasharray="4 8"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
            </svg>
            
            {/* Initials Center */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="absolute text-2xl font-display font-extrabold tracking-widest text-white drop-shadow-[0_0_8px_#ff7b00]"
            >
              KG
            </motion.div>
          </motion.div>

          {/* Loading Progress Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isExploded ? 0 : 0.8, y: 0 }}
            className="mt-8 font-display font-medium text-sm text-white/50 tracking-widest"
          >
            {loadingText}
          </motion.div>
        </div>

        {/* Dynamic Explosion Particles */}
        {isExploded && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => {
              const angle = (i / 30) * Math.PI * 2;
              const velocity = Math.random() * 200 + 150;
              const tx = Math.cos(angle) * velocity;
              const ty = Math.sin(angle) * velocity;
              const randomColor = ['#ff7b00', '#ff8800', '#ffd000', '#ffea00'][
                Math.floor(Math.random() * 4)
              ];

              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, scale: 1.5, opacity: 1 }}
                  animate={{ x: tx, y: ty, scale: 0, opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="absolute w-2 h-2 rounded-full left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%]"
                  style={{
                    backgroundColor: randomColor,
                    boxShadow: `0 0 10px ${randomColor}`,
                  }}
                />
              );
            })}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default IntroLoader;
