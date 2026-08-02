import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import type { VisitorType } from '../context/PortfolioContext';
import sound from '../utils/sound';

const VisitorPersonalizer: React.FC = () => {
  const { visitorType, setVisitorType } = usePortfolio();
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    // Only show if visitor hasn't personalized yet (default: 'browsing')
    const hasPersonalized = localStorage.getItem('visitor-type');
    if (!hasPersonalized) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2000); // Show 2s after loader finishes
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelectType = (type: VisitorType) => {
    sound.playClick();
    setVisitorType(type);
    setShowBanner(false);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setShowBanner(false);
  };

  const options: { type: VisitorType; label: string; desc: string }[] = [
    { type: 'recruiter', label: 'Recruiter 💼', desc: 'Prioritizes resume, contact details, and certifications first.' },
    { type: 'judge', label: 'Judge 🏆', desc: 'Highlights hackathons and technical projects.' },
    { type: 'student', label: 'Student 🎓', desc: 'Emphasizes my journey timeline, skills, and coding interests.' },
  ];

  return (
    <AnimatePresence>
      {showBanner && visitorType === 'browsing' && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 30, x: '-50%' }}
          transition={{ type: 'spring', damping: 22, stiffness: 180 }}
          className="fixed bottom-24 left-1/2 z-40 w-[90%] max-w-xl p-6 rounded-3xl bg-black/85 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col text-left font-sans select-none"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/5 text-white/50 hover:text-white cursor-pointer bg-transparent border-0"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Heading */}
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-harvest-orange animate-pulse" />
            <h4 className="font-display font-black text-sm text-white uppercase tracking-wider">
              Personalize Your Experience
            </h4>
          </div>

          <p className="text-white/60 dark:text-white/60 light:text-black/60 text-xs leading-relaxed mb-5">
            Select who you are visiting as to tailor the sections and layout order for your criteria. You can change this anytime in the navigation bar.
          </p>

          {/* Option Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {options.map((opt) => (
              <button
                key={opt.type}
                onClick={() => handleSelectType(opt.type)}
                className="p-3 text-left rounded-xl bg-white/5 hover:bg-linear-to-r hover:from-harvest-orange hover:to-gold hover:text-black border border-white/10 hover:border-transparent text-white font-display font-bold text-xs cursor-pointer transition-all duration-300 shadow-sm"
                title={opt.desc}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VisitorPersonalizer;
