import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Compass, Edit3, FileText, RotateCw } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

const iconMap: Record<string, any> = {
  compass: Compass,
  edit: Edit3,
  'file-text': FileText,
  'rotate-cw': RotateCw,
};

const AchievementToast: React.FC = () => {
  const { activeToast, setActiveToast } = usePortfolio();

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 4000); // Hide after 4s
      return () => clearTimeout(timer);
    }
  }, [activeToast, setActiveToast]);

  const Icon = activeToast ? iconMap[activeToast.icon] || Award : Award;

  return (
    <AnimatePresence>
      {activeToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 p-5 rounded-2xl bg-black/90 backdrop-blur-xl border border-harvest-orange/30 shadow-[0_0_20px_rgba(255,123,0,0.25)] flex items-center gap-4 text-left font-sans max-w-sm"
        >
          {/* Glowing Trophy / Badge Icon */}
          <div className="p-3 rounded-xl bg-linear-to-br from-harvest-orange to-gold text-black animate-bounce">
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex-1 space-y-0.5">
            <span className="text-[10px] font-display font-black uppercase tracking-widest text-harvest-orange animate-pulse">
              Achievement Unlocked! 🏆
            </span>
            <h4 className="font-display font-black text-sm text-white">
              {activeToast.title}
            </h4>
            <p className="text-white/60 dark:text-white/60 light:text-black/60 text-[11px] leading-relaxed">
              {activeToast.desc}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementToast;
