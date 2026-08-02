import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, RotateCcw, Cpu, Trophy, AlertTriangle, 
  ChevronLeft, ChevronRight, Volume2, VolumeX 
} from 'lucide-react';
import sound from '../utils/sound';
import { usePortfolio } from '../context/PortfolioContext';

// Game engines
import EmberBreaker from './arcade/EmberBreaker';
import SignalRunner from './arcade/SignalRunner';
import GateCracker from './arcade/GateCracker';
import NeonSnake from './arcade/NeonSnake';

interface Game {
  id: string;
  title: string;
  subtitle: string;
  startLabel: string;
  instructions: string;
  highScoreKey: string;
}

const games: Game[] = [
  { 
    id: 'breaker', 
    title: 'Ember Breaker', 
    subtitle: 'Paddle/ball breakout sprint', 
    startLabel: 'START SPRINTS', 
    instructions: 'Slide paddle using mouse/drag or Left/Right keys. Shatter all gold blocks.',
    highScoreKey: 'arcade-highscore-breaker' 
  },
  { 
    id: 'runner', 
    title: 'Signal Runner', 
    subtitle: 'Endless dodge/collect track', 
    startLabel: 'START RUN', 
    instructions: 'Move left/right using Arrow keys, clicking, or drag. Dodge static (red), collect data (gold).',
    highScoreKey: 'arcade-highscore-runner' 
  },
  { 
    id: 'cracker', 
    title: 'Gate Cracker', 
    subtitle: 'Pattern-memory security hack', 
    startLabel: 'START HACK', 
    instructions: 'Watch the sequence of glowing security panels. Repeat them in order to crack the gate.',
    highScoreKey: 'arcade-highscore-cracker' 
  },
  { 
    id: 'snake', 
    title: 'Neon Snake', 
    subtitle: 'Retro grid pellet collector', 
    startLabel: 'START SLITHER', 
    instructions: 'Use arrow keys or swipe. Eat data nodes (gold). Avoid boundaries and your tail.',
    highScoreKey: 'arcade-highscore-snake' 
  }
];

const MiniArcade: React.FC = () => {
  const { unlockBadge } = usePortfolio();
  const totalRounds = 4;

  // Carousel & Insert Coin states
  const [activeGameIndex, setActiveGameIndex] = useState<number>(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [coinInserted, setCoinInserted] = useState<boolean>(false);
  const [flashScreen, setFlashScreen] = useState<boolean>(false);
  
  // Game control states
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover' | 'victory'>('idle');
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [round, setRound] = useState<number>(1);
  const [snakeLength, setSnakeLength] = useState<number>(3);
  const [useAI, setUseAI] = useState<boolean>(false);

  // Extra features
  const [crtMode, setCrtMode] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted());
  const [celebrationText, setCelebrationText] = useState<string>('');
  const [highScores, setHighScores] = useState<Record<string, number>>({});

  // Parallax background offset
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Load high scores & sound subscriptions
  useEffect(() => {
    const scores: Record<string, number> = {};
    games.forEach((g) => {
      scores[g.id] = Number(localStorage.getItem(g.highScoreKey)) || 0;
    });
    setHighScores(scores);

    return sound.subscribe((muted) => setIsMuted(muted));
  }, []);

  const activeGame = games[activeGameIndex];

  // Parallax section handler
  const handleSectionMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2); // -1 to 1
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2); // -1 to 1
    setMouseOffset({ x, y });
  };

  // Keyboard navigation for Carousel (only when not playing)
  useEffect(() => {
    if (gameState === 'playing' || !coinInserted) return;

    const handleCarouselKeys = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevGame();
      } else if (e.key === 'ArrowRight') {
        handleNextGame();
      }
    };
    window.addEventListener('keydown', handleCarouselKeys);
    return () => window.removeEventListener('keydown', handleCarouselKeys);
  }, [gameState, activeGameIndex, coinInserted]);

  // Track games played for achievements
  const trackGamePlayed = (gameId: string) => {
    try {
      const saved = localStorage.getItem('arcade-games-played');
      const played = saved ? JSON.parse(saved) : [];
      if (!played.includes(gameId)) {
        const nextPlayed = [...played, gameId];
        localStorage.setItem('arcade-games-played', JSON.stringify(nextPlayed));
        if (nextPlayed.length === 4) {
          unlockBadge('gamer');
        }
      }
    } catch (e) {
      console.warn('Failed to track played games', e);
    }
  };

  // Navigation handlers
  const handlePrevGame = () => {
    if (gameState === 'playing') return;
    sound.playClick();
    setDirection('left');
    setActiveGameIndex((prev) => (prev === 0 ? games.length - 1 : prev - 1));
    setGameState('idle');
    setScore(0);
    setLives(3);
    setRound(1);
    setSnakeLength(3);
    setUseAI(false);
  };

  const handleNextGame = () => {
    if (gameState === 'playing') return;
    sound.playClick();
    setDirection('right');
    setActiveGameIndex((prev) => (prev === games.length - 1 ? 0 : prev + 1));
    setGameState('idle');
    setScore(0);
    setLives(3);
    setRound(1);
    setSnakeLength(3);
    setUseAI(false);
  };

  const handleDotClick = (index: number) => {
    if (gameState === 'playing') return;
    sound.playClick();
    setDirection(index > activeGameIndex ? 'right' : 'left');
    setActiveGameIndex(index);
    setGameState('idle');
    setScore(0);
    setLives(3);
    setRound(1);
    setSnakeLength(3);
    setUseAI(false);
  };

  // Coin insertion click
  const handleInsertCoin = () => {
    // Play NES chiptune coin sound: two rising sweeps
    sound.playGameTone(987.77, 0.08, 'square'); // B5
    setTimeout(() => {
      sound.playGameTone(1318.51, 0.25, 'square'); // E6
    }, 80);

    setFlashScreen(true);
    setTimeout(() => {
      setCoinInserted(true);
      setFlashScreen(false);
    }, 250);
  };

  const handleStartGame = () => {
    sound.playClick();
    setGameState('playing');
    setScore(0);
    setLives(3);
    setRound(1);
    setSnakeLength(3);
    trackGamePlayed(activeGame.id);
  };

  // Handle score/lives status changes from game engines
  const handleStatusChange = (status: { score: number; lives?: number; round?: number; length?: number }) => {
    setScore(status.score);
    if (status.lives !== undefined) setLives(status.lives);
    if (status.round !== undefined) setRound(status.round);
    if (status.length !== undefined) setSnakeLength(status.length);

    // Dynamic high score update
    const currentHigh = highScores[activeGame.id] || 0;
    if (status.score > currentHigh) {
      localStorage.setItem(activeGame.highScoreKey, String(status.score));
      setHighScores((prev) => ({ ...prev, [activeGame.id]: status.score }));
      
      // Flash celebratory popup
      if (currentHigh > 0 && celebrationText !== '⚡ New Personal Best!') {
        triggerCelebration('⚡ New Personal Best!');
      }
    }
  };

  const triggerCelebration = (text: string) => {
    setCelebrationText(text);
    setTimeout(() => {
      setCelebrationText('');
    }, 2000);
  };

  const toggleMute = () => {
    sound.toggleMute();
    setIsMuted(sound.isMuted());
  };

  // Frame sliding variants
  const slideVariants = {
    enter: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? 160 : -160,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 150, damping: 18 }
    },
    exit: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? -160 : 160,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    })
  };

  return (
    <section
      id="arcade-section"
      onMouseMove={handleSectionMouseMove}
      className="relative py-24 px-6 sm:px-12 md:px-20 lg:px-32 xl:px-40 overflow-hidden bg-[#07070a] border-t border-white/5"
    >
      {/* 1. Ambient Parallax Arcade Background Room */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-40 transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${mouseOffset.x * -12}px, ${mouseOffset.y * -12}px)`
        }}
      >
        {/* Left Cabinet Silhouette */}
        <div className="absolute left-[8%] top-[20%] w-36 h-96 border border-white/5 bg-white/2 rounded-t-3xl blur-xs transform -rotate-12 shadow-2xl flex items-center justify-center">
          <div className="w-20 h-40 bg-harvest-orange/5 blur-xl"></div>
        </div>

        {/* Right Cabinet Silhouette */}
        <div className="absolute right-[8%] top-[25%] w-36 h-96 border border-white/5 bg-white/2 rounded-t-3xl blur-xs transform rotate-12 shadow-2xl flex items-center justify-center">
          <div className="w-20 h-40 bg-gold/5 blur-xl"></div>
        </div>
      </div>

      {/* Parallax Slow-Drifting Dust Particles */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-harvest-orange/25 blur-[1px]"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatUp ${Math.random() * 12 + 10}s linear infinite`,
              animationDelay: `${Math.random() * -10}s`
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(120vh) translateX(0); opacity: 0; }
          15% { opacity: 0.4; }
          85% { opacity: 0.4; }
          100% { transform: translateY(-20vh) translateX(40px); opacity: 0; }
        }
      `}</style>

      {/* Floor Glow Pooling radial gradient */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at bottom, rgba(255, 123, 0, 0.08) 0%, rgba(255, 208, 0, 0.02) 50%, transparent 80%)',
          transform: `translate(${mouseOffset.x * -8}px, 0)`
        }}
      />

      <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
        
        {/* Section Header */}
        <div className="mb-12 text-left w-full">
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight flex items-center gap-3">
            Mini Arcade
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-white/50 font-sans">
            A few small breaks. Demos of canvas physics & game logic across different genres.
          </p>
          <div className="w-16 h-1 bg-linear-to-r from-harvest-orange to-gold mt-4 rounded-full"></div>
        </div>

        {/* Carousel & Cabinet Outer Container */}
        <div className="relative w-full max-w-xl flex items-center justify-center">
          
          {/* Left Navigation Arrow */}
          <button
            onClick={handlePrevGame}
            disabled={gameState === 'playing' || !coinInserted}
            className={`absolute -left-12 sm:-left-16 z-20 w-10 h-10 rounded-full bg-black/80 border border-white/10 flex items-center justify-center transition-all cursor-pointer ${
              gameState === 'playing' || !coinInserted
                ? 'opacity-20 cursor-not-allowed'
                : 'hover:border-harvest-orange hover:bg-harvest-orange/10 hover:scale-105 active:scale-95'
            }`}
          >
            <ChevronLeft className="w-5 h-5 text-harvest-orange" />
          </button>

          {/* Right Navigation Arrow */}
          <button
            onClick={handleNextGame}
            disabled={gameState === 'playing' || !coinInserted}
            className={`absolute -right-12 sm:-right-16 z-20 w-10 h-10 rounded-full bg-black/80 border border-white/10 flex items-center justify-center transition-all cursor-pointer ${
              gameState === 'playing' || !coinInserted
                ? 'opacity-20 cursor-not-allowed'
                : 'hover:border-harvest-orange hover:bg-harvest-orange/10 hover:scale-105 active:scale-95'
            }`}
          >
            <ChevronRight className="w-5 h-5 text-harvest-orange" />
          </button>

          {/* 2. Stylized Retro Arcade Machine Cabinet Frame */}
          <div 
            className="relative w-full p-1 rounded-[32px] bg-linear-to-b from-[#ff7b00]/30 to-[#ffd000]/10 shadow-[0_0_50px_rgba(255,123,0,0.25)]"
            style={{
              transform: `translate(${mouseOffset.x * 5}px, ${mouseOffset.y * 5}px)`
            }}
          >
            <div className="relative w-full p-4 sm:p-6 rounded-[28px] bg-[#0c0c0e] border border-white/15 shadow-2xl flex flex-col items-center select-none overflow-hidden">
              
              {/* Corner Bolt Rivets */}
              <div className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full bg-neutral-800 border border-neutral-700 shadow-inner" />
              <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-neutral-800 border border-neutral-700 shadow-inner" />
              <div className="absolute bottom-3 left-3 w-2.5 h-2.5 rounded-full bg-neutral-800 border border-neutral-700 shadow-inner" />
              <div className="absolute bottom-3 right-3 w-2.5 h-2.5 rounded-full bg-neutral-800 border border-neutral-700 shadow-inner" />

              {/* Blinking Coin Slot Graphic Trim */}
              <div className="w-full flex justify-center mb-2">
                <div className={`px-4 py-1.5 rounded-md border flex items-center gap-1.5 transition-all duration-500 ${
                  coinInserted 
                    ? 'border-white/10 bg-white/2 text-white/30' 
                    : 'border-red-500/50 bg-red-950/20 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-pulse'
                }`}>
                  <div className={`w-1.5 h-3.5 rounded-xs ${coinInserted ? 'bg-neutral-600' : 'bg-red-500'}`} />
                  <span className="text-[8px] font-mono font-bold tracking-widest">
                    {coinInserted ? '25¢ COIN INSERTED' : '25¢ INSERT COIN'}
                  </span>
                </div>
              </div>

              {/* Status Indicator Bar (Dashboard) */}
              <div className="flex justify-between w-full mb-3 px-1 text-xs font-mono">
                <div className="flex gap-4">
                  <span className="text-white/40">SCORE: <strong className="text-gold">{score}</strong></span>
                  <span className="text-white/40">
                    {activeGame.id === 'snake' ? (
                      <>LENGTH: <strong className="text-gold">{snakeLength}</strong></>
                    ) : activeGame.id === 'cracker' ? (
                      <>ROUND: <strong className="text-gold">{round}/{totalRounds}</strong></>
                    ) : (
                      <>LIVES: <strong className="text-red-400">{'❤️'.repeat(lives)}</strong></>
                    )}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* AI Autopilot Switch */}
                  {activeGame.id !== 'breaker' && (
                    <button
                      onClick={() => setUseAI(!useAI)}
                      disabled={!coinInserted}
                      className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border cursor-pointer transition-all ${
                        !coinInserted ? 'opacity-20 cursor-not-allowed' :
                        useAI
                          ? 'border-harvest-orange text-harvest-orange bg-harvest-orange/5 animate-pulse'
                          : 'border-white/10 text-white/30 hover:text-white/50'
                      }`}
                    >
                      <Cpu className="w-3 h-3" />
                      {useAI ? 'Watch AI' : 'Manual AI'}
                    </button>
                  )}

                  {/* Exit Game Button */}
                  {gameState === 'playing' && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        setGameState('idle');
                      }}
                      className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-red-500/40 text-red-500 bg-red-950/20 hover:bg-red-950/40 hover:text-red-450 cursor-pointer transition-all"
                      title="Exit game to cartridges"
                    >
                      Exit Game
                    </button>
                  )}

                  {/* sound control */}
                  <button
                    onClick={toggleMute}
                    className="p-1 rounded-sm hover:bg-white/5 text-white/40 hover:text-white/60 cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Viewport Canvas container */}
              <div className="relative aspect-[3/2] w-full rounded-2xl overflow-hidden border border-white/10 bg-[#060608] flex items-center justify-center">
                
                {/* 3. Blinking Attract Attraction Screen Overlay */}
                <AnimatePresence>
                  {!coinInserted ? (
                    <motion.div
                      key="attract"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={handleInsertCoin}
                      className="absolute inset-0 bg-[#07070a]/95 z-30 cursor-pointer flex flex-col items-center justify-center p-6 text-center group"
                    >
                      <div className="w-16 h-16 rounded-full bg-linear-to-tr from-harvest-orange to-gold p-0.5 shadow-[0_0_20px_rgba(255,123,0,0.3)] mb-4 group-hover:scale-105 transition-transform duration-300">
                        <div className="w-full h-full rounded-full bg-[#0a0a0c] flex items-center justify-center text-gold font-display font-extrabold text-xl">
                          25¢
                        </div>
                      </div>
                      <h3 className="font-display font-black text-2xl text-white uppercase tracking-widest mb-1">
                        NEON RETRO ARCADE
                      </h3>
                      <p className="text-[10px] text-white/40 font-mono mb-8 uppercase tracking-wider">
                        Select a cartridge & insert coin to start
                      </p>
                      
                      <div className="font-mono text-xs font-bold text-harvest-orange tracking-widest animate-pulse">
                        INSERT COIN TO PLAY ▸
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* White Flash Transition Effect */}
                <AnimatePresence>
                  {flashScreen && (
                    <motion.div 
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.25 } }}
                      className="absolute inset-0 bg-white z-40"
                    />
                  )}
                </AnimatePresence>

                {/* Active Game Slider Viewport */}
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={activeGame.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full h-full"
                  >
                    {/* Lazy render game engine when active & coin inserted */}
                    {coinInserted && (
                      <>
                        {activeGame.id === 'breaker' && (
                          <EmberBreaker 
                            gameState={gameState} 
                            setGameState={setGameState}
                            onStatusChange={handleStatusChange}
                            useAI={useAI}
                          />
                        )}
                        {activeGame.id === 'runner' && (
                          <SignalRunner 
                            gameState={gameState} 
                            setGameState={setGameState}
                            onStatusChange={handleStatusChange}
                            useAI={useAI}
                            onCelebration={triggerCelebration}
                          />
                        )}
                        {activeGame.id === 'cracker' && (
                          <GateCracker 
                            gameState={gameState} 
                            setGameState={setGameState}
                            onStatusChange={handleStatusChange}
                            useAI={useAI}
                            onCelebration={triggerCelebration}
                          />
                        )}
                        {activeGame.id === 'snake' && (
                          <NeonSnake 
                            gameState={gameState} 
                            setGameState={setGameState}
                            onStatusChange={handleStatusChange}
                            useAI={useAI}
                            onCelebration={triggerCelebration}
                          />
                        )}
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Celebration Streak Popups */}
                <AnimatePresence>
                  {celebrationText && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.7, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -15 }}
                      className="absolute top-12 px-4 py-1.5 rounded-full bg-linear-to-r from-harvest-orange to-gold text-black font-display font-black text-xs uppercase tracking-widest shadow-lg pointer-events-none z-10"
                    >
                      {celebrationText}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Screen CURVATURE CRT Overlay grid */}
                {crtMode && (
                  <div className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay opacity-60 bg-[radial-gradient(circle,_transparent_50%,_rgba(0,0,0,0.55)_100%)]">
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: 'repeating-linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.3) 50%)',
                        backgroundSize: '100% 4px'
                      }}
                    />
                  </div>
                )}

                {/* Game state overlays (Start, Gameover, Victory) */}
                <AnimatePresence>
                  {coinInserted && gameState === 'idle' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10"
                    >
                      <Trophy className="w-10 h-10 text-gold mb-3 animate-bounce" />
                      <h3 className="font-display font-black text-xl text-white uppercase tracking-wider mb-2">
                        {activeGame.title}
                      </h3>
                      <p className="text-[11px] text-white/50 font-sans max-w-xs leading-relaxed mb-6">
                        {activeGame.instructions}
                      </p>
                      
                      <button
                        onClick={handleStartGame}
                        className="px-6 py-3 bg-linear-to-r from-harvest-orange to-gold text-black rounded-xl text-xs font-display font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer border-0 shadow-md transition-all hover:scale-105 active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        {activeGame.startLabel}
                      </button>
                    </motion.div>
                  )}

                  {coinInserted && gameState === 'gameover' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10"
                    >
                      <AlertTriangle className="w-10 h-10 text-red-500 mb-3 animate-pulse" />
                      <h3 className="font-display font-black text-xl text-white uppercase tracking-wider mb-2">
                        System Crash
                      </h3>
                      <p className="text-xs text-white/50 mb-6 font-mono">
                        Game over. Score: <strong className="text-gold font-mono">{score}</strong>.
                      </p>
                      
                      <button
                        onClick={handleStartGame}
                        className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-display font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-105 active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Compile Again
                      </button>
                    </motion.div>
                  )}

                  {coinInserted && gameState === 'victory' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10"
                    >
                      <Trophy className="w-12 h-12 text-gold mb-3" />
                      <h3 className="font-display font-black text-xl text-white uppercase tracking-wider mb-2">
                        {activeGame.id === 'cracker' ? 'GATE CRACKED! 🔓' : 'VICTORY! 🏆'}
                      </h3>
                      <p className="text-[11px] text-white/50 max-w-xs mb-6 leading-relaxed">
                        Excellent execution with a final score of <strong className="text-gold font-mono">{score}</strong>.
                      </p>
                      
                      <button
                        onClick={handleStartGame}
                        className="px-6 py-3 bg-linear-to-r from-harvest-orange to-gold text-black rounded-xl text-xs font-display font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer border-0 shadow-md transition-all hover:scale-105 active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Play Again
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Console game details */}
              <div className="w-full text-center mt-4">
                <span className="text-[10px] font-display font-bold tracking-widest text-white/40 block uppercase">
                  {activeGame.subtitle}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel indicators dots */}
        <div className="flex gap-2.5 mt-6 z-10">
          {games.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              disabled={gameState === 'playing' || !coinInserted}
              className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                idx === activeGameIndex
                  ? 'bg-linear-to-r from-harvest-orange to-gold w-6'
                  : 'bg-white/10 hover:bg-white/30'
              } ${gameState === 'playing' || !coinInserted ? 'opacity-20 cursor-not-allowed' : ''}`}
              title={`Switch to ${games[idx].title}`}
            />
          ))}
        </div>

        {/* CRT Overlay Toggle button */}
        <div className="mt-8 flex gap-4 items-center z-10">
          <button
            onClick={() => setCrtMode(!crtMode)}
            className={`px-4 py-2 rounded-full border text-[10px] font-display font-bold uppercase tracking-widest cursor-pointer transition-all ${
              crtMode
                ? 'border-harvest-orange text-harvest-orange bg-harvest-orange/5'
                : 'border-white/10 text-white/40 hover:text-white/60 hover:bg-white/5'
            }`}
          >
            📺 CRT Mode: {crtMode ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* 4. Shared Leaderboard scores widget */}
        <div className="w-full max-w-md mt-16 p-6 rounded-2xl bg-white/3 border border-white/5 text-left z-10">
          <h4 className="font-display font-bold text-xs uppercase tracking-widest text-white/60 mb-4 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-gold" /> Personal Best Leaderboard
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {games.map((g) => (
              <div key={g.id} className="p-3.5 rounded-xl bg-white/2 border border-white/5 flex flex-col">
                <span className="text-[10px] font-mono text-white/40 uppercase">{g.title}</span>
                <span className="text-lg font-display font-extrabold text-white mt-1">
                  {highScores[g.id] || 0} <span className="text-[10px] font-mono text-gold font-normal">PTS</span>
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default MiniArcade;
