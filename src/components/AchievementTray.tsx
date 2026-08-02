import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Compass, Edit3, FileText, RotateCw, Lock } from 'lucide-react';
import { usePortfolio, BADGES } from '../context/PortfolioContext';
import sound from '../utils/sound';

const iconMap: Record<string, any> = {
  compass: Compass,
  edit: Edit3,
  'file-text': FileText,
  'rotate-cw': RotateCw,
};

const AchievementTray: React.FC = () => {
  const { unlockedBadges, resetAchievements } = usePortfolio();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleOpen = () => {
    sound.playClick();
    setIsOpen(!isOpen);
  };

  const percentage = (unlockedBadges.length / BADGES.length) * 100;
  const strokeCircumference = 2 * Math.PI * 18; // radius 18
  const strokeDashoffset = strokeCircumference - (strokeCircumference * percentage) / 100;

  return (
    <>
      {/* Floating Trophy Badge Trigger */}
      <div className="fixed bottom-6 left-6 z-40 select-none font-sans">
        <button
          onClick={toggleOpen}
          className="relative w-14 h-14 rounded-full bg-black/85 backdrop-blur-md border border-white/10 hover:border-harvest-orange/40 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer transition-all duration-300 shadow-2xl group"
          title="Inspect Achievements"
        >
          {/* Progress Circular Arc */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="28"
              cy="28"
              r="18"
              className="stroke-white/5"
              strokeWidth="2.5"
              fill="transparent"
            />
            <motion.circle
              cx="28"
              cy="28"
              r="18"
              className="stroke-harvest-orange"
              strokeWidth="2.5"
              fill="transparent"
              strokeDasharray={strokeCircumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </svg>

          {/* Icon */}
          <Trophy className="w-5 h-5 text-gold group-hover:scale-110 transition-transform duration-300" />
          
          {/* Unlocked Badges count indicator */}
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-linear-to-r from-harvest-orange to-gold text-black text-[9px] font-black flex items-center justify-center shadow-md animate-pulse">
            {unlockedBadges.length}
          </span>
        </button>
      </div>

      {/* Slide-out Achievement Tray Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleOpen}
              className="fixed inset-0 bg-black/60 z-45"
            />

            {/* Panel Card */}
            <motion.div
              initial={{ opacity: 0, x: -50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -35, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-24 left-6 z-45 w-[90%] max-w-sm p-6 rounded-3xl bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col text-left font-sans"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-harvest-orange animate-pulse" />
                  <h4 className="font-display font-black text-sm text-white uppercase tracking-wider">
                    Explorer Badges
                  </h4>
                </div>
                <button
                  onClick={toggleOpen}
                  className="p-1 rounded-full hover:bg-white/5 text-white/50 hover:text-white cursor-pointer bg-transparent border-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress summary bar */}
              <div className="mb-6 space-y-2">
                <div className="flex justify-between text-[10px] font-display font-bold uppercase tracking-wider text-white/40">
                  <span>Journey Progress</span>
                  <span className="text-gold font-mono">{unlockedBadges.length} / {BADGES.length} Badges</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-harvest-orange to-gold transition-all duration-550"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Badges Grid list */}
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {BADGES.map((badge) => {
                  const isUnlocked = unlockedBadges.includes(badge.id);
                  const Icon = iconMap[badge.icon] || Trophy;

                  return (
                    <div
                      key={badge.id}
                      className={`p-3 rounded-2xl border transition-all duration-300 flex items-center gap-3.5 ${
                        isUnlocked
                          ? 'bg-harvest-orange/5 border-harvest-orange/30 shadow-[0_0_10px_rgba(255,123,0,0.05)]'
                          : 'bg-white/2 border-white/5 opacity-55'
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${
                          isUnlocked
                            ? 'bg-linear-to-br from-harvest-orange to-gold text-black border-transparent'
                            : 'bg-white/5 border-white/5 text-white/30'
                        }`}
                      >
                        {isUnlocked ? <Icon className="w-4.5 h-4.5" /> : <Lock className="w-4.5 h-4.5" />}
                      </div>

                      {/* Text */}
                      <div className="text-left space-y-0.5">
                        <h5 className={`font-display font-bold text-xs ${isUnlocked ? 'text-white' : 'text-white/40'}`}>
                          {badge.title}
                        </h5>
                        <p className={`text-[10px] leading-snug ${isUnlocked ? 'text-white/60' : 'text-white/30'}`}>
                          {badge.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reset Control Footer */}
              <div className="pt-4 mt-5 border-t border-white/5 flex justify-between items-center text-[10px]">
                <span className="text-white/30">Progression saved in browser storage.</span>
                <button
                  onClick={resetAchievements}
                  className="text-red-400 hover:text-red-300 hover:underline cursor-pointer bg-transparent border-0"
                >
                  Reset Progress
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AchievementTray;
