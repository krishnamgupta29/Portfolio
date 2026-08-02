import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import TextScramble from './TextScramble';
import MagneticCard from './MagneticCard';
import sound from '../utils/sound';
import { usePortfolio } from '../context/PortfolioContext';
import ScrollCompanion from './ScrollCompanion';

const roles = ["AI/ML Enthusiast", "Web Developer", "Hackathon Winner", "Game Dev Explorer"];

const Hero: React.FC = () => {
  const [roleIndex, setRoleIndex] = useState<number>(0);
  const { visitorCount } = usePortfolio();

  useEffect(() => {
    const timer = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const handleScrollTo = (id: string) => {
    sound.playClick();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center items-center px-6 sm:px-12 md:px-20 lg:px-32 xl:px-40 py-20 overflow-hidden"
    >
      <div className="w-full max-w-7xl z-10 flex flex-col lg:flex-row items-center justify-between gap-12 text-left">
        <div className="max-w-3xl">
          {/* Intro & Visitor Badge Row */}
          <div className="flex flex-wrap gap-3 mb-6 items-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-harvest-orange/10 border border-harvest-orange/20 text-harvest-orange font-display text-xs font-semibold uppercase tracking-widest"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-harvest-orange animate-ping" />
              Welcome to my universe
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold font-display text-xs font-semibold uppercase tracking-widest"
            >
              <span>🌌</span>
              Explorer #{visitorCount}
            </motion.div>
          </div>

          {/* Heading */}
          <h1 className="font-display font-black text-4xl sm:text-5xl md:text-7xl leading-[1.1] text-white dark:text-white light:text-black tracking-tight mb-6 select-none">
            Hi, I'm <br className="sm:hidden" />
            <span className="bg-linear-to-r from-harvest-orange via-gold to-sunbeam-yellow bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(255,123,0,0.15)] font-black">
              <TextScramble text="Krishnam Gupta" delay={300} duration={1000} />
            </span>
          </h1>

          {/* Dynamic Rotating Role */}
          <h2 className="font-display font-bold text-xl sm:text-2xl md:text-3xl text-white/90 dark:text-white/90 light:text-black/90 mb-6">
            I am a{' '}
            <span className="relative inline-block min-w-[200px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={roleIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="bg-linear-to-r from-harvest-orange to-gold bg-clip-text text-transparent font-extrabold"
                >
                  {roles[roleIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-white/60 dark:text-white/60 light:text-black/60 font-sans text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mb-10"
          >
            B.Tech CSE (AI/ML) student at{' '}
            <span className="text-white dark:text-white light:text-black font-semibold">GLA University</span>,
            building intelligent systems and modern web experiences through hands-on projects and hackathons.
          </motion.p>

          {/* Call To Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="flex flex-wrap gap-4 sm:gap-6 items-center"
          >
            {/* Magnetic CTA 1 */}
            <MagneticCard maxPull={10} maxTilt={6}>
              <button
                onClick={() => handleScrollTo('contact-section')}
                className="flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-linear-to-r from-harvest-orange to-gold text-black font-bold text-xs sm:text-sm tracking-widest uppercase cursor-pointer hover:shadow-[0_0_20px_rgba(255,123,0,0.4)] transition-all duration-300 border-0"
              >
                Connect with Me 🤝
                <ArrowRight className="w-4 h-4" />
              </button>
            </MagneticCard>

            {/* Magnetic CTA 2 */}
            <MagneticCard maxPull={10} maxTilt={6}>
              <button
                onClick={() => handleScrollTo('projects-section')}
                className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-full border border-white/10 dark:border-white/10 light:border-black/15 text-white dark:text-white light:text-black hover:text-harvest-orange font-bold text-xs sm:text-sm tracking-widest uppercase cursor-pointer hover:bg-white/5 transition-colors duration-300 bg-transparent"
              >
                Explore Projects 🚀
              </button>
            </MagneticCard>
          </motion.div>
        </div>

        {/* Right Stage: ScrollCompanion in Hero Stage position */}
        <ScrollCompanion />
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-10 left-[50%] -translate-x-[50%] flex flex-col items-center gap-2 cursor-pointer text-white/50 hover:text-white transition-colors duration-300"
        onClick={() => handleScrollTo('about-section')}
      >
        <span className="font-display font-medium text-[10px] uppercase tracking-widest">Scroll Down</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 text-harvest-orange" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
