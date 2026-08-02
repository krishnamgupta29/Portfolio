import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Database, Globe, Sparkles, Code, Box, Cpu, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import sound from '../utils/sound';

interface SkillChapter {
  chapter: number;
  title: string;
  story: string;
  icon: any;
  color: string;
  badgeText: string;
  badgeTarget: string;
}

const chapters: SkillChapter[] = [
  {
    chapter: 1,
    title: 'Python Core',
    story: 'Python is my primary scripting tool. I understand its core syntax and standard libraries, writing automation scripts and data routines.',
    icon: Terminal,
    color: '#ff7b00',
    badgeText: 'Featured in: IIT Ropar Hackathon 🏆',
    badgeTarget: 'hackathons'
  },
  {
    chapter: 2,
    title: 'SQL Databases',
    story: 'Relational data structures are essential. I construct standard queries, aggregate sets, and join database tables.',
    icon: Database,
    color: '#ff8800',
    badgeText: 'Featured in: Guestbook Database 🗄️',
    badgeTarget: 'guestbook'
  },
  {
    chapter: 3,
    title: 'Data Engineering (Theory)',
    story: 'ETL frameworks process datasets at scale. I study pipeline theories, data warehousing models, and cleaning processes.',
    icon: Database,
    color: '#ffa200',
    badgeText: 'Theory: ETL Pipeline Model ⚙️',
    badgeTarget: 'projects'
  },
  {
    chapter: 4,
    title: 'Web Application Dev',
    story: 'Building dynamic interfaces is a core passion. I craft modular pages, flex-grids, state engines, and client logic.',
    icon: Globe,
    color: '#ffd000',
    badgeText: 'Featured in: Portfolio Universe 🌐',
    badgeTarget: 'hero'
  },
  {
    chapter: 5,
    title: 'AI/ML Foundations',
    story: 'Machine learning bridges theory and utility. I explore neural nodes, backpropagation, and regression curves.',
    icon: Sparkles,
    color: '#ffaa00',
    badgeText: 'Featured in: DevNotes Search 🔍',
    badgeTarget: 'devnotes'
  },
  {
    chapter: 6,
    title: 'C Programming',
    story: 'Low level logic forms the foundation of systems. I write structures, pointers, and memory-safe functions.',
    icon: Code,
    color: '#ffb700',
    badgeText: 'Featured in: Logic Sandbox 💻',
    badgeTarget: 'projects'
  },
  {
    chapter: 7,
    title: 'Unity Engine & Game Dev',
    story: 'Games drive interactive logic and mechanics. I structure coordinate systems, input listeners, and simulation updates.',
    icon: Box,
    color: '#ffd700',
    badgeText: 'Featured in: Mini Arcade 🎮',
    badgeTarget: 'arcade'
  },
  {
    chapter: 8,
    title: 'Logic Building',
    story: 'Optimized pathways organize complex code. I evaluate loop complexities, BFS pathfinding, and conditional gates.',
    icon: Cpu,
    color: '#ffea00',
    badgeText: 'Featured in: Hackathon Projects 🏆',
    badgeTarget: 'hackathons'
  },
];

/* ==========================================================================
   ATMOSPHERIC SKILLS BACKGROUND (BEHIND THE BOOK)
   ========================================================================== */
interface ParticleConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  duration: number;
  delay: number;
}

const SkillsAtmosphericBackground: React.FC = () => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Listen for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // IntersectionObserver to pause/resume animation when section is out of view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Mouse move tracking for parallax when in view
  useEffect(() => {
    if (!isInView || reducedMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isInView, reducedMotion]);

  // Deterministic 3 particle layers
  const farParticles = useRef<ParticleConfig[]>(
    Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      x: (i * 17 + 7) % 96 + 2,
      y: (i * 23 + 11) % 94 + 3,
      size: 1.5 + (i % 3) * 0.5,
      baseOpacity: 0.12 + (i % 4) * 0.04,
      duration: 4.0 + (i % 5) * 0.8,
      delay: (i % 7) * 0.4,
    }))
  ).current;

  const midParticles = useRef<ParticleConfig[]>(
    Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      x: (i * 29 + 13) % 92 + 4,
      y: (i * 31 + 19) % 90 + 5,
      size: 2.8 + (i % 3) * 0.8,
      baseOpacity: 0.25 + (i % 3) * 0.08,
      duration: 5.0 + (i % 4) * 1.0,
      delay: (i % 5) * 0.5,
    }))
  ).current;

  const nearParticles = useRef<ParticleConfig[]>(
    Array.from({ length: 7 }).map((_, i) => ({
      id: i,
      x: (i * 41 + 15) % 88 + 6,
      y: (i * 47 + 23) % 85 + 7,
      size: 4.5 + (i % 2) * 1.5,
      baseOpacity: 0.45 + (i % 3) * 0.12,
      duration: 3.5 + (i % 3) * 0.7,
      delay: (i % 4) * 0.3,
    }))
  ).current;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
    >
      {/* 1A. Soft Radial Spotlight Glow centered behind the book */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[520px] rounded-full pointer-events-none blur-[100px] opacity-75"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255,136,0,0.12) 0%, rgba(255,170,0,0.03) 55%, transparent 80%)',
        }}
      />

      {/* 1B. Edge Vignette Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.65) 100%)',
        }}
      />

      {/* 3. Slow-Drifting Ambient Gradient Mesh Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Blob 1: Top-Left to Center Warm Orange Glow */}
        <motion.div
          animate={
            reducedMotion || !isInView
              ? { x: 0, y: 0, scale: 1 }
              : {
                  x: [-30, 40, -20, -30],
                  y: [-20, 30, 40, -20],
                  scale: [1, 1.2, 0.9, 1],
                }
          }
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-24 left-1/4 w-[480px] h-[480px] rounded-full blur-[110px] opacity-25"
          style={{
            background:
              'radial-gradient(circle, rgba(255,123,0,0.22) 0%, rgba(255,170,0,0.04) 70%, transparent 100%)',
          }}
        />

        {/* Blob 2: Bottom-Right Warm Gold Glow */}
        <motion.div
          animate={
            reducedMotion || !isInView
              ? { x: 0, y: 0, scale: 1 }
              : {
                  x: [40, -30, 25, 40],
                  y: [30, -40, -15, 30],
                  scale: [1.1, 0.85, 1.15, 1.1],
                }
          }
          transition={{
            duration: 34,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-24 right-1/4 w-[520px] h-[520px] rounded-full blur-[120px] opacity-20"
          style={{
            background:
              'radial-gradient(circle, rgba(255,200,0,0.20) 0%, rgba(255,136,0,0.03) 70%, transparent 100%)',
          }}
        />

        {/* Blob 3: Center Amber Core */}
        <motion.div
          animate={
            reducedMotion || !isInView
              ? { x: 0, y: 0, scale: 1 }
              : {
                  x: [0, 20, -25, 0],
                  y: [0, -25, 20, 0],
                  scale: [0.95, 1.15, 1.0, 0.95],
                }
          }
          transition={{
            duration: 38,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full blur-[95px] opacity-18"
          style={{
            background:
              'radial-gradient(circle, rgba(255,140,0,0.25) 0%, rgba(255,110,0,0.03) 75%, transparent 100%)',
          }}
        />
      </div>

      {/* 2. Layered Particle Depth-Field */}

      {/* FAR LAYER (slow drift, shift ~4px) */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: reducedMotion
            ? 'none'
            : `translate3d(${mousePos.x * 4}px, ${mousePos.y * 4}px, 0)`,
        }}
      >
        {farParticles.map((p) => (
          <motion.div
            key={`far-${p.id}`}
            animate={
              reducedMotion || !isInView
                ? { opacity: p.baseOpacity }
                : {
                    opacity: [p.baseOpacity * 0.4, p.baseOpacity * 1.3, p.baseOpacity * 0.4],
                    y: [0, -10, 0],
                  }
            }
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: '#ff8800',
              boxShadow: '0 0 4px rgba(255, 136, 0, 0.4)',
            }}
          />
        ))}
      </div>

      {/* MID LAYER (moderate drift, shift ~12px) */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-500 ease-out"
        style={{
          transform: reducedMotion
            ? 'none'
            : `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0)`,
        }}
      >
        {midParticles.map((p) => (
          <motion.div
            key={`mid-${p.id}`}
            animate={
              reducedMotion || !isInView
                ? { opacity: p.baseOpacity }
                : {
                    opacity: [p.baseOpacity * 0.5, p.baseOpacity * 1.4, p.baseOpacity * 0.5],
                    y: [0, -16, 0],
                    x: [0, 8, 0],
                  }
            }
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: '#ffaa00',
              boxShadow: '0 0 8px rgba(255, 170, 0, 0.6)',
            }}
          />
        ))}
      </div>

      {/* NEAR LAYER (faster drift, shift ~25px, larger glowing dots) */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-300 ease-out"
        style={{
          transform: reducedMotion
            ? 'none'
            : `translate3d(${mousePos.x * 25}px, ${mousePos.y * 25}px, 0)`,
        }}
      >
        {nearParticles.map((p) => (
          <motion.div
            key={`near-${p.id}`}
            animate={
              reducedMotion || !isInView
                ? { opacity: p.baseOpacity }
                : {
                    opacity: [p.baseOpacity * 0.6, p.baseOpacity * 1.5, p.baseOpacity * 0.6],
                    y: [0, -24, 0],
                    scale: [1, 1.25, 1],
                  }
            }
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: '#ffd700',
              boxShadow:
                '0 0 12px rgba(255, 215, 0, 0.8), 0 0 4px rgba(255, 123, 0, 0.9)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* ==========================================================================
   PARALLAX PARTICLES
   ========================================================================== */
const ParallaxParticles: React.FC<{ currentPage: number }> = ({ currentPage }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);

  useEffect(() => {
    const list = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setParticles(list);
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          animate={{
            y: [`${p.y}%`, `${p.y - 12}%`, `${p.y}%`],
            x: [`${p.x}%`, `${p.x + (currentPage % 2 === 0 ? 6 : -6)}%`, `${p.x}%`],
          }}
          transition={{
            duration: 8 + p.delay * 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: '#ff8800',
            opacity: 0.12,
            filter: 'blur(0.5px)',
            boxShadow: '0 0 6px rgba(255,136,0,0.6)',
          }}
        />
      ))}
    </div>
  );
};

/* ==========================================================================
   GLOW-WRITING CHAPTER TITLE
   ========================================================================== */
const GlowTitle: React.FC<{ text: string; isVisible: boolean }> = ({ text, isVisible }) => {
  const [reducedMotion, setReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
  }, []);

  const characters = text.split('');
  
  if (!isVisible || reducedMotion) {
    return <h3 className="font-display font-black text-xl sm:text-2xl text-white mb-2 tracking-tight select-none">{text}</h3>;
  }

  return (
    <h3 className="font-display font-black text-xl sm:text-2xl text-white mb-2 flex flex-wrap tracking-tight select-none">
      {characters.map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, textShadow: '0 0 0px rgba(255,136,0,0)' }}
          animate={{
            opacity: 1,
            textShadow: [
              '0 0 0px rgba(255,136,0,0)',
              '0 0 12px rgba(255,136,0,0.8)',
              '0 0 4px rgba(255,208,0,0.5)',
              '0 0 0px rgba(255,136,0,0)'
            ],
            color: ['#ffffff', '#ffaa00', '#ffffff']
          }}
          transition={{
            duration: 1.0,
            delay: index * 0.04,
            ease: 'easeInOut',
          }}
          className="whitespace-pre"
        >
          {char}
        </motion.span>
      ))}
    </h3>
  );
};

/* ==========================================================================
   PAGE CORNER HOVER CURL
   ========================================================================== */
const PageCornerCurl: React.FC<{ isLeft: boolean; onClick: () => void }> = ({ isLeft, onClick }) => {
  return (
    <motion.div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      whileHover="hover"
      initial="rest"
      className={`absolute bottom-0 ${isLeft ? 'left-0' : 'right-0'} w-12 h-12 cursor-pointer z-30 overflow-hidden`}
    >
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        variants={{
          rest: { scale: 1 },
          hover: { scale: 1.1 }
        }}
      >
        <motion.path
          d={isLeft ? "M 0 100 L 35 100 L 0 65 Z" : "M 100 100 L 65 100 L 100 65 Z"}
          fill="rgba(255, 136, 0, 0.08)"
          variants={{
            rest: { fill: "rgba(255, 136, 0, 0.08)" },
            hover: { fill: "rgba(255, 136, 0, 0.2)" }
          }}
        />
        <motion.path
          d={isLeft ? "M 0 65 L 35 65 L 35 100 Z" : "M 100 65 L 65 65 L 65 100 Z"}
          fill="rgba(30, 28, 26, 0.95)"
          stroke="rgba(255, 136, 0, 0.4)"
          strokeWidth="1.5"
          variants={{
            rest: { 
              rotate: 0,
              filter: "none"
            },
            hover: { 
              scale: 1.05,
              filter: "drop-shadow(0 0 4px rgba(255,136,0,0.5))"
            }
          }}
        />
      </motion.svg>
    </motion.div>
  );
};

/* ==========================================================================
   1. PYTHON CODE EDITOR DEMO
   ========================================================================== */
const PythonDemo: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const code = `# [PYTHON_SNIPPET_PLACEHOLDER]\ndef greet(universe):\n    print(f"Hello, {universe}!")\n    return "🧭 Explorer #21"\n\ngreet("Universe")`;
  const [displayText, setDisplayText] = useState('');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setDisplayText('');
      return;
    }
    if (reducedMotion) {
      setDisplayText(code);
      return;
    }
    let idx = 0;
    const interval = setInterval(() => {
      setDisplayText(code.slice(0, idx + 1));
      idx++;
      if (idx >= code.length) {
        clearInterval(interval);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [isVisible, reducedMotion]);

  return (
    <div className="font-mono text-[9px] sm:text-[10px] bg-black/60 border border-white/10 rounded-xl p-3 h-[180px] overflow-hidden flex flex-col justify-between">
      <div className="flex gap-1.5 mb-2 border-b border-white/5 pb-1">
        <span className="w-2 h-2 rounded-full bg-red-500/80" />
        <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
        <span className="w-2 h-2 rounded-full bg-green-500/80" />
        <span className="text-[8px] text-white/40 ml-2">main.py</span>
      </div>
      <div className="flex-1 overflow-y-auto select-none leading-relaxed">
        {displayText.split('\n').map((line, i) => (
          <div key={i} className="flex">
            <span className="text-white/20 w-4 select-none mr-2 text-right">{i + 1}</span>
            <span className="text-white/80 whitespace-pre">
              {line.split(/(\bdef\b|\bprint\b|\breturn\b|"[^"]*"|#[^\n]*)/g).map((part, j) => {
                if (part === 'def' || part === 'return') return <span key={j} className="text-orange-400 font-bold">{part}</span>;
                if (part === 'print') return <span key={j} className="text-yellow-300">{part}</span>;
                if (part.startsWith('"') && part.endsWith('"')) return <span key={j} className="text-green-300">{part}</span>;
                if (part.startsWith('#')) return <span key={j} className="text-white/40 italic">{part}</span>;
                return part;
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==========================================================================
   2. SQL TERMINAL DEMO
   ========================================================================== */
const SqlDemo: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const query = `/* [SQL_QUERY_PLACEHOLDER] */\nSELECT * FROM projects WHERE status = 'live';`;
  const [displayText, setDisplayText] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setDisplayText('');
      setShowTable(false);
      return;
    }
    if (reducedMotion) {
      setDisplayText(query);
      setShowTable(true);
      return;
    }
    let idx = 0;
    const interval = setInterval(() => {
      setDisplayText(query.slice(0, idx + 1));
      idx++;
      if (idx >= query.length) {
        clearInterval(interval);
        setTimeout(() => setShowTable(true), 300);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [isVisible, reducedMotion]);

  return (
    <div className="font-mono text-[9px] sm:text-[10px] bg-black/60 border border-white/10 rounded-xl p-3 h-[180px] overflow-hidden flex flex-col justify-between">
      <div className="flex-1 space-y-2 overflow-y-auto leading-tight">
        <div className="flex items-center gap-1 text-white/40 text-[8px] mb-1">
          <Database className="w-2.5 h-2.5" />
          <span>psql -h db.krishnam.space</span>
        </div>
        <div className="text-white/90 whitespace-pre-wrap">
          <span className="text-orange-400">db=&gt;</span> {displayText}
          {!showTable && !reducedMotion && <span className="animate-pulse">|</span>}
        </div>
        {showTable && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1.5 text-[8.5px] text-white/70"
          >
            <div className="text-green-400/80">Running... 3 rows returned</div>
            <div className="border-t border-b border-white/10 py-1 font-mono grid grid-cols-3 gap-2">
              <span className="font-bold text-white/50">id</span>
              <span className="font-bold text-white/50">title</span>
              <span className="font-bold text-white/50">stars</span>
              
              <span>1</span>
              <span className="text-yellow-300/90">Portfolio</span>
              <span>⭐ 21</span>

              <span>2</span>
              <span className="text-yellow-300/90">Arcade</span>
              <span>⭐ 15</span>

              <span>3</span>
              <span className="text-yellow-300/90">Chatbot</span>
              <span>⭐ 8</span>
            </div>
            <div className="text-white/30 text-[7px] italic">/* [SQL_RESULT_ROWS_PLACEHOLDER] */</div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

/* ==========================================================================
   3. DATA PIPELINE VISUALIZER (DATA ENGINEERING / DATA SCIENCE)
   ========================================================================== */
const DataEngDemo: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setActiveStep(0);
      return;
    }
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 1800);
    return () => clearInterval(interval);
  }, [isVisible]);

  const steps = [
    { label: 'Raw Log 📥', desc: 'API Stream' },
    { label: 'Clean ⚙️', desc: 'Spark ETL' },
    { label: 'Store 💾', desc: 'DB S3' },
    { label: 'Serve 📊', desc: 'Redshift' }
  ];

  return (
    <div className="bg-black/60 border border-white/10 rounded-xl p-3 h-[180px] flex flex-col justify-center items-center font-sans">
      <div className="grid grid-cols-4 gap-1 w-full items-center relative">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center relative z-10">
              <motion.div
                animate={{
                  scale: activeStep === idx ? 1.08 : 1.0,
                  backgroundColor: activeStep === idx ? '#ff8800' : 'rgba(255,255,255,0.04)',
                  borderColor: activeStep === idx ? '#ffaa00' : 'rgba(255,255,255,0.08)',
                  boxShadow: activeStep === idx ? '0 0 10px rgba(255,136,0,0.5)' : 'none'
                }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 rounded-xl border flex items-center justify-center text-[9px] text-white font-bold"
              >
                {step.label.split(' ')[1] || '⚙️'}
              </motion.div>
              <span className="text-[8px] text-white/80 font-bold mt-1 text-center leading-none">{step.label.split(' ')[0]}</span>
              <span className="text-[6.5px] text-white/40 mt-0.5 text-center leading-none scale-90">{step.desc}</span>
            </div>
            {idx < 3 && (
              <div className="absolute top-[20px] h-[1.5px] bg-white/10" style={{ left: `${idx * 25 + 15}%`, width: '18%' }}>
                <motion.div
                  initial={{ left: '0%' }}
                  animate={activeStep === idx ? { left: ['0%', '100%'] } : { left: '0%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-0 w-2 h-[1.5px] bg-linear-to-r from-orange-400 to-yellow-300 shadow-[0_0_6px_#ff8800]"
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-4 text-center">
        <span className="text-[8.5px] font-mono text-orange-400 font-semibold animate-pulse">
          {activeStep === 0 && 'Ingesting JSON payload streams...'}
          {activeStep === 1 && 'Transforming: validation & null checks...'}
          {activeStep === 2 && 'Loading to analytical warehouses...'}
          {activeStep === 3 && 'Refreshing dashboards & reports...'}
        </span>
      </div>
    </div>
  );
};

/* ==========================================================================
   4. WEB APPLICATION DEV LIVE PREVIEW
   ========================================================================== */
const WebDevDemo: React.FC = () => {
  const [clicked, setClicked] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    sound.playClick();
    setClicked(true);
    setTimeout(() => setClicked(false), 300);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newSparkles = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 30,
      y: y + (Math.random() - 0.5) * 30,
    }));
    setSparkles((prev) => [...prev, ...newSparkles]);
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => !newSparkles.find((ns) => ns.id === s.id)));
    }, 800);
  };

  return (
    <div className="bg-black/60 border border-white/10 rounded-xl p-3 h-[180px] flex flex-col justify-between font-mono text-[9px]">
      <div className="grid grid-cols-2 gap-2 h-full items-stretch">
        <div className="flex flex-col justify-between border-r border-white/5 pr-2">
          <div className="text-white/40 uppercase tracking-widest text-[7px] mb-1">Source Code</div>
          <pre className="text-white/70 overflow-hidden leading-normal select-none">
            <span className="text-orange-400">&lt;button</span><br />
            &nbsp;&nbsp;<span className="text-yellow-300">className=</span><span className="text-green-300">"glowing"</span><br />
            &nbsp;&nbsp;<span className="text-yellow-300">onClick=</span>{`{spark}`} <br />
            <span className="text-orange-400">&gt;</span><br />
            &nbsp;&nbsp;Launch 🚀<br />
            <span className="text-orange-400">&lt;/button&gt;</span>
          </pre>
        </div>
        <div className="flex flex-col justify-center items-center pl-2 relative overflow-hidden">
          <div className="text-white/40 uppercase tracking-widest text-[7px] absolute top-0">Live Preview</div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-harvest-orange to-gold text-black font-sans font-extrabold uppercase tracking-wider shadow-[0_0_10px_rgba(255,123,0,0.35)] border-none cursor-pointer relative"
          >
            Launch 🚀
            {clicked && (
              <motion.span
                layoutId="btn-glow"
                className="absolute inset-0 rounded-lg border-2 border-yellow-300 animate-ping pointer-events-none"
              />
            )}
          </motion.button>
          
          {sparkles.map((s) => (
            <motion.span
              key={s.id}
              initial={{ scale: 1.2, opacity: 1 }}
              animate={{ scale: 0, opacity: 0, y: -15 }}
              transition={{ duration: 0.6 }}
              style={{ position: 'absolute', left: s.x, top: s.y }}
              className="text-[10px] pointer-events-none"
            >
              ✨
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   5. AI/ML NEURAL FLOW
   ========================================================================== */
const AiMlDemo: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const [phase, setPhase] = useState<'input' | 'processing' | 'output'>('input');
  
  useEffect(() => {
    if (!isVisible) {
      setPhase('input');
      return;
    }
    const interval = setInterval(() => {
      setPhase((prev) => {
        if (prev === 'input') return 'processing';
        if (prev === 'processing') return 'output';
        return 'input';
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="bg-black/60 border border-white/10 rounded-xl p-3 h-[180px] flex flex-col justify-between items-center text-center font-sans">
      <div className="text-white/40 uppercase tracking-widest text-[7px] self-start">Neural Classifier</div>
      
      <div className="flex items-center justify-around w-full flex-1">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{
              scale: phase === 'input' ? 1.12 : 1,
              borderColor: phase === 'input' ? '#ff8800' : 'rgba(255,255,255,0.1)',
            }}
            className="w-9 h-9 rounded-full border bg-white/5 flex items-center justify-center text-base"
          >
            🖼️
          </motion.div>
          <span className="text-[7.5px] text-white/50 mt-1 font-mono">Input Image</span>
        </div>

        <div className="text-white/20 text-[10px]">➡️</div>

        <div className="flex gap-1 relative py-1 px-1.5 border border-white/5 rounded-lg bg-white/5 scale-90">
          <div className="flex flex-col gap-1 justify-center">
            <span className={`w-1.5 h-1.5 rounded-full ${phase === 'processing' ? 'bg-orange-500 animate-pulse shadow-[0_0_6px_#ff8800]' : 'bg-white/20'}`} />
            <span className={`w-1.5 h-1.5 rounded-full ${phase === 'processing' ? 'bg-orange-500 animate-pulse shadow-[0_0_6px_#ff8800]' : 'bg-white/20'}`} />
          </div>
          <div className="flex flex-col gap-1 justify-center">
            <span className={`w-1.5 h-1.5 rounded-full ${phase === 'processing' ? 'bg-yellow-400 animate-pulse shadow-[0_0_6px_#facc15]' : 'bg-white/20'}`} />
            <span className={`w-1.5 h-1.5 rounded-full ${phase === 'processing' ? 'bg-yellow-400 animate-pulse shadow-[0_0_6px_#facc15]' : 'bg-white/20'}`} />
          </div>
          <div className="flex flex-col gap-1 justify-center">
            <span className={`w-1.5 h-1.5 rounded-full ${phase === 'processing' ? 'bg-orange-500 animate-pulse shadow-[0_0_6px_#ff8800]' : 'bg-white/20'}`} />
          </div>
          <span className="text-[6px] text-white/30 absolute -bottom-3 left-1/2 -translate-x-1/2 font-mono whitespace-nowrap">Model (CNN)</span>
        </div>

        <div className="text-white/20 text-[10px]">➡️</div>

        <div className="flex flex-col items-center">
          <motion.div
            animate={{
              scale: phase === 'output' ? 1.12 : 1,
              borderColor: phase === 'output' ? '#22c55e' : 'rgba(255,255,255,0.1)',
            }}
            className="w-9 h-9 rounded-full border bg-white/5 flex items-center justify-center text-base"
          >
            🐱
          </motion.div>
          <span className="text-[7.5px] text-white/50 mt-1 font-mono">Prediction</span>
        </div>
      </div>

      <div className="text-[8.5px] font-mono h-4">
        {phase === 'input' && <span className="text-white/40">Queueing sample data...</span>}
        {phase === 'processing' && <span className="text-yellow-400 font-semibold animate-pulse">Running forward pass...</span>}
        {phase === 'output' && <span className="text-green-400 font-bold">Cat Identified! (98%) 🎯</span>}
      </div>
    </div>
  );
};

/* ==========================================================================
   6. C PROGRAMMING COMPILER DEMO
   ========================================================================== */
const CDemo: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const code = `#include <stdio.h>\nint main() {\n    printf("Logic compiled\\n");\n    return 0;\n}`;
  const [displayText, setDisplayText] = useState('');
  const [showCompiling, setShowCompiling] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setDisplayText('');
      setShowCompiling(false);
      setShowOutput(false);
      return;
    }
    if (reducedMotion) {
      setDisplayText(code);
      setShowCompiling(true);
      setShowOutput(true);
      return;
    }
    let idx = 0;
    const interval = setInterval(() => {
      setDisplayText(code.slice(0, idx + 1));
      idx++;
      if (idx >= code.length) {
        clearInterval(interval);
        setTimeout(() => {
          setShowCompiling(true);
          setTimeout(() => {
            setShowOutput(true);
          }, 800);
        }, 300);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [isVisible, reducedMotion]);

  return (
    <div className="font-mono text-[8.5px] sm:text-[9.5px] bg-black/60 border border-white/10 rounded-xl p-3 h-[180px] overflow-hidden flex flex-col justify-between">
      <div className="flex-1 space-y-1.5 overflow-y-auto leading-tight select-none">
        <div className="text-white/80 whitespace-pre font-bold">{displayText}</div>
        
        {showCompiling && (
          <div className="text-yellow-400/90 mt-2">
            $ gcc main.c -o main<br />
            Compiling... Done ✅
          </div>
        )}
        
        {showOutput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-400"
          >
            $ ./main<br />
            Logic compiled
          </motion.div>
        )}
      </div>
    </div>
  );
};

/* ==========================================================================
   7. UNITY / GAME DEV CLICKER MINI GAME
   ========================================================================== */
const UnityDemo: React.FC = () => {
  const [score, setScore] = useState(0);
  const [position, setPosition] = useState({ x: 40, y: 40 });
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const moveSaucer = () => {
    if (!containerRef.current) return;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    const targetX = Math.random() * (w - 24) + 8;
    const targetY = Math.random() * (h - 24) + 8;
    setPosition({ x: targetX, y: targetY });
  };

  useEffect(() => {
    moveSaucer();
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    sound.playClick();
    setScore((prev) => prev + 1);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = containerRef.current?.getBoundingClientRect();
    if (parentRect) {
      const x = rect.left - parentRect.left + 8;
      const y = rect.top - parentRect.top + 8;
      const id = Date.now();
      setSparkles((prev) => [...prev, { id, x, y }]);
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== id));
      }, 600);
    }
    
    moveSaucer();
  };

  return (
    <div className="bg-black/60 border border-white/10 rounded-xl p-3 h-[180px] flex flex-col justify-between font-mono text-[9px] relative overflow-hidden select-none">
      <div className="flex justify-between items-center text-white/40 uppercase tracking-widest text-[7px] z-10">
        <span>Unity Engine Clicker</span>
        <span className="text-yellow-400 font-bold">Score: {score}</span>
      </div>

      <div ref={containerRef} className="flex-1 w-full relative mt-2 rounded-lg bg-black/40 overflow-hidden border border-white/5 cursor-crosshair">
        <motion.span
          animate={{ x: position.x, y: position.y }}
          transition={{ type: 'spring', stiffness: 220, damping: 14 }}
          onClick={handleClick}
          className="text-base cursor-pointer absolute select-none p-1 inline-block -mt-3.5 -ml-3.5"
        >
          🛸
        </motion.span>

        {sparkles.map((s) => (
          <motion.span
            key={s.id}
            initial={{ scale: 1.4, opacity: 1 }}
            animate={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ position: 'absolute', left: s.x, top: s.y }}
            className="text-[10px] pointer-events-none -mt-2 -ml-2"
          >
            💥
          </motion.span>
        ))}
      </div>
      <div className="text-[7px] text-white/30 text-center mt-1">Tap the flying saucer to steer!</div>
    </div>
  );
};

/* ==========================================================================
   8. LOGIC MAZE PATHFINDER
   ========================================================================== */
const LogicDemo: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const [visitedNodes, setVisitedNodes] = useState<number[]>([]);
  const [foundPath, setFoundPath] = useState(false);

  const path = [0, 1, 2, 6, 10, 14, 15]; 

  useEffect(() => {
    if (!isVisible) {
      setVisitedNodes([]);
      setFoundPath(false);
      return;
    }
    
    let step = 0;
    const interval = setInterval(() => {
      if (step < path.length) {
        setVisitedNodes((prev) => [...prev, path[step]]);
        step++;
      } else {
        setFoundPath(true);
        clearInterval(interval);
        setTimeout(() => {
          setVisitedNodes([]);
          setFoundPath(false);
        }, 1800);
      }
    }, 320);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="bg-black/60 border border-white/10 rounded-xl p-3 h-[180px] flex flex-col justify-between items-center font-mono text-[9px]">
      <div className="text-white/40 uppercase tracking-widest text-[7px] self-start">Logic Pathfinder (BFS)</div>

      <div className="grid grid-cols-4 gap-1.5 my-1.5">
        {Array.from({ length: 16 }).map((_, idx) => {
          const isStart = idx === 0;
          const isEnd = idx === 15;
          const isVisited = visitedNodes.includes(idx);
          const isCurrent = visitedNodes[visitedNodes.length - 1] === idx;
          const isObstacle = [3, 4, 7, 8, 9, 13].includes(idx);

          return (
            <motion.div
              key={idx}
              animate={{
                backgroundColor: isCurrent
                  ? '#ff8800'
                  : isVisited
                  ? 'rgba(255, 136, 0, 0.22)'
                  : isObstacle
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(255,255,255,0.02)',
                borderColor: isCurrent
                  ? '#ffaa00'
                  : isVisited
                  ? 'rgba(255, 136, 0, 0.35)'
                  : isObstacle
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(255,255,255,0.04)',
                boxShadow: isCurrent ? '0 0 8px rgba(255, 136, 0, 0.5)' : 'none',
              }}
              className="w-6 h-6 rounded-md border flex items-center justify-center text-[9px]"
            >
              {isStart && '🔑'}
              {isEnd && (foundPath ? '🔓' : '📦')}
              {!isStart && !isEnd && isObstacle && '🧱'}
            </motion.div>
          );
        })}
      </div>

      <div className="text-[8.5px] font-bold text-center h-4">
        {foundPath ? (
          <span className="text-green-400 animate-bounce">Goal Reached! Open sesame 🔓</span>
        ) : (
          <span className="text-orange-400 animate-pulse">Running path search...</span>
        )}
      </div>
    </div>
  );
};

/* ==========================================================================
   CHAPTER PAGE CONTENT COMPONENT (DRY LAYOUT)
   ========================================================================== */
const ChapterPageContent: React.FC<{
  chapterIndex: number;
  eli5Mode: boolean;
  isVisible: boolean;
}> = ({ chapterIndex, eli5Mode, isVisible }) => {
  const chapter = chapters[chapterIndex];
  if (!chapter) return null;

  const getSubtext = () => {
    if (eli5Mode) {
      switch (chapter.chapter) {
        case 1: return "Python helps me write friendly instructions for the computer.";
        case 2: return "SQL is like a digital storage box to keep data organized.";
        case 3: return "I design pipelines to clean and move streams of data.";
        case 4: return "Web dev is how I build pretty screens for web browsers.";
        case 5: return "AI helps computer models learn patterns from pictures.";
        case 6: return "C is where I learned pointers and core programming logic.";
        case 7: return "Unity helps me construct games and interactive logic loops.";
        case 8: return "I love solving puzzles and finding the shortest routes.";
        default: return "";
      }
    }
    switch (chapter.chapter) {
      case 1: return "Writing clean, structured scripts and automation routines.";
      case 2: return "Structuring queries, joining tables, and parsing databases.";
      case 3: return "Modeling analytical pipeline processes and data streams.";
      case 4: return "Crafting responsive interfaces, DOM nodes, and styles.";
      case 5: return "Analyzing patterns, models, and forward propagation logic.";
      case 6: return "Low level logic gates, memory structures, and code loops.";
      case 7: return "Creating interactive scripts and game loop frameworks.";
      case 8: return "Evaluating loop complexities and pathfinding matrices.";
      default: return "";
    }
  };

  return (
    <div className="flex flex-col justify-between h-full text-left relative z-10 select-none">
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-[9px] font-mono text-gold font-bold">CHAPTER 0{chapter.chapter}</span>
          <div
            className="p-1 rounded-lg text-black bg-gradient-to-r from-harvest-orange to-gold"
            style={{ boxShadow: `0 0 10px ${chapter.color}40` }}
          >
            {React.createElement(chapter.icon, { className: 'w-3 h-3' })}
          </div>
        </div>

        <GlowTitle text={chapter.title} isVisible={isVisible} />

        <p className="text-white/60 text-[10px] mb-3 min-h-[28px] leading-relaxed">
          {getSubtext()}
        </p>

        <div className="relative">
          {chapter.chapter === 1 && <PythonDemo isVisible={isVisible} />}
          {chapter.chapter === 2 && <SqlDemo isVisible={isVisible} />}
          {chapter.chapter === 3 && <DataEngDemo isVisible={isVisible} />}
          {chapter.chapter === 4 && <WebDevDemo />}
          {chapter.chapter === 5 && <AiMlDemo isVisible={isVisible} />}
          {chapter.chapter === 6 && <CDemo isVisible={isVisible} />}
          {chapter.chapter === 7 && <UnityDemo />}
          {chapter.chapter === 8 && <LogicDemo isVisible={isVisible} />}
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-end">
        <span className="text-[9px] text-white/30 font-mono">Page 0{chapter.chapter}</span>
      </div>
    </div>
  );
};

/* ==========================================================================
   MAIN COMPONENT: SKILLS STORYBOOK
   ========================================================================== */
const SkillsStorybook: React.FC = () => {
  const { eli5Mode, markSectionVisited } = usePortfolio();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isAutoplay, setIsAutoplay] = useState<boolean>(false);
  const autoplayTimer = useRef<any>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isAutoplay) {
      const maxPages = isMobile ? 10 : 6;
      autoplayTimer.current = setInterval(() => {
        sound.playPageFlip();
        setCurrentPage((prev) => (prev >= maxPages - 1 ? 0 : prev + 1));
      }, 4800);
    } else if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
    }
    return () => clearInterval(autoplayTimer.current);
  }, [isAutoplay, isMobile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      const maxPages = isMobile ? 10 : 6;
      if (e.key === 'ArrowRight' && currentPage < maxPages - 1) handleNext();
      else if (e.key === 'ArrowLeft' && currentPage > 0) handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, isMobile]);

  const handleOpenBook = () => { sound.playPageFlip(); setIsOpen(true); setCurrentPage(1); };
  const handleCloseBook = () => { sound.playPageFlip(); setIsOpen(false); setCurrentPage(0); };
  const handleNext = () => { if (currentPage < (isMobile ? 9 : 5)) { sound.playPageFlip(); setCurrentPage(prev => prev + 1); } };
  const handlePrev = () => { if (currentPage > 0) { sound.playPageFlip(); setCurrentPage(prev => prev - 1); if (currentPage === 1) setIsOpen(false); } };

  const bookmarkTop = isMobile
    ? `${15 + (currentPage * 7)}%`
    : `${15 + (currentPage * 12)}%`;

  /* ==========================================================================
     MOBILE VIEW
     ========================================================================== */
  const renderMobile = () => (
    <div className="flex flex-col items-center gap-6 py-6 w-full max-w-sm mx-auto relative">
      <AnimatePresence mode="wait">
        {currentPage === 0 ? (
          <motion.div
            onClick={handleOpenBook}
            className="w-full aspect-[3/4] p-8 rounded-3xl bg-[#141210] border-4 border-[#ff7b00]/25 shadow-2xl flex flex-col justify-between items-center text-center cursor-pointer relative overflow-hidden"
          >
            <span className="text-[9px] font-display font-bold uppercase tracking-widest text-[#ff7b00] pt-4">Personal Journal</span>
            <div className="space-y-4 z-10">
              <BookOpen className="w-10 h-10 text-gold mx-auto animate-pulse" />
              <h3 className="font-display font-black text-2xl text-white tracking-tight">KRISHNAM'S<br />SKILL DIARY</h3>
              <div className="w-12 h-0.5 bg-linear-to-r from-harvest-orange to-gold mx-auto" />
            </div>
            <span className="text-[10px] font-display font-bold text-gold uppercase tracking-wider animate-bounce pb-4">Tap to open 📖</span>
          </motion.div>
        ) : currentPage <= 8 ? (
          <motion.div
            key={currentPage}
            style={{
              background: `radial-gradient(circle at 50% 50%, ${chapters[currentPage - 1].color}12 0%, #0f0e0d 100%)`,
            }}
            className="w-full aspect-[3/4] p-6 rounded-3xl border border-white/5 shadow-2xl flex flex-col justify-between text-left relative overflow-hidden"
          >
            <ChapterPageContent
              chapterIndex={currentPage - 1}
              eli5Mode={eli5Mode}
              isVisible={isOpen}
            />
            {/* Tactile Page Curl */}
            {currentPage > 1 && (
              <PageCornerCurl isLeft={true} onClick={handlePrev} />
            )}
            {currentPage < 9 && (
              <PageCornerCurl isLeft={false} onClick={handleNext} />
            )}
          </motion.div>
        ) : (
          <motion.div className="w-full aspect-[3/4] p-8 rounded-3xl bg-[#141210] border border-white/5 shadow-2xl flex flex-col justify-between items-center text-center">
            <h3 className="font-display font-black text-lg text-white">THE STORY'S STILL BEING WRITTEN 📖</h3>
            <button onClick={handleCloseBook} className="text-[10px] font-display font-semibold uppercase tracking-widest text-[#ff8800] hover:underline pb-4 cursor-pointer">Close Journal ↩</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookmark Ribbon on Mobile */}
      {isOpen && (
        <motion.div
          animate={{ top: bookmarkTop }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="absolute right-[-6px] w-3 h-12 bg-gradient-to-b from-harvest-orange to-gold rounded-r shadow-md z-30"
        />
      )}

      {isOpen && (
        <div className="flex gap-4 items-center mt-2">
          <button onClick={handlePrev} className="p-2.5 rounded-full border border-white/10 text-white hover:text-harvest-orange cursor-pointer bg-transparent"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs font-mono text-white/50">{currentPage} / 9</span>
          <button onClick={handleNext} className="p-2.5 rounded-full border border-white/10 text-white hover:text-harvest-orange cursor-pointer bg-transparent"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );

  /* ==========================================================================
     DESKTOP VIEW
     ========================================================================== */
  const renderDesktop = () => (
    <div className="flex flex-col items-center gap-8 py-8 w-full max-w-4xl mx-auto">
      <div className="relative w-[740px] h-[450px] flex items-center justify-center">
        {!isOpen ? (
          <motion.div
            onClick={handleOpenBook}
            className="w-[370px] h-full p-10 rounded-r-3xl bg-[#141210] border-4 border-l-black/60 shadow-2xl flex flex-col justify-between items-center cursor-pointer relative overflow-hidden"
            style={{ perspective: '1500px' }}
          >
            <span className="text-[10px] font-display font-black text-[#ff7b00]">Personal Journal</span>
            <div className="space-y-4">
              <BookOpen className="w-12 h-12 text-gold mx-auto animate-pulse" />
              <h3 className="font-display font-black text-3xl text-white">KRISHNAM'S<br />SKILL DIARY</h3>
            </div>
            <span className="text-[11px] font-display font-bold text-gold animate-bounce">Click to open 📖</span>
          </motion.div>
        ) : (
          <motion.div className="flex w-[740px] h-[450px] bg-[#0c0b0a] rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 bottom-0 left-[50%] -translate-x-[50%] w-8 bg-linear-to-r from-black/60 via-black/85 to-black/60 z-20" />
            
            {/* Left Page */}
            <div
              className="w-1/2 h-full p-8 flex flex-col justify-between border-r border-black/30 text-left relative"
              style={{
                background: currentPage === 5
                  ? 'radial-gradient(circle at 50% 50%, rgba(255, 123, 0, 0.05) 0%, #0c0b0a 100%)'
                  : `radial-gradient(circle at 50% 50%, ${chapters[(currentPage - 1) * 2].color}12 0%, #0c0b0a 100%)`,
              }}
            >
              {currentPage === 5 ? (
                <div className="flex flex-col justify-between h-full relative z-10 select-none">
                  <div>
                    <h3 className="font-display font-black text-2xl text-white mb-4">Aspirations & Goals 🌌</h3>
                    <p className="text-white/70 text-sm leading-relaxed mb-6">
                      Every project is a stepping stone. I am focusing on neural network architectures, custom datasets, and procedural generation in game engines to combine my AI/ML knowledge with immersive web and gaming environments.
                    </p>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gold/80 italic font-medium">
                      "The best way to predict the future is to build it." 🛠️
                    </div>
                  </div>
                  <div className="text-[11px] text-white/40 font-mono">Page 09</div>
                </div>
              ) : (
                <ChapterPageContent
                  chapterIndex={(currentPage - 1) * 2}
                  eli5Mode={eli5Mode}
                  isVisible={isOpen && currentPage >= 1 && currentPage <= 4}
                />
              )}

              {/* Tactile Page Curl */}
              {currentPage > 1 && (
                <PageCornerCurl isLeft={true} onClick={handlePrev} />
              )}
            </div>

            {/* Right Page */}
            <div
              className="w-1/2 h-full p-8 flex flex-col justify-between text-left relative"
              style={{
                background: currentPage === 5
                  ? 'radial-gradient(circle at 50% 50%, rgba(255, 208, 0, 0.05) 0%, #0c0b0a 100%)'
                  : `radial-gradient(circle at 50% 50%, ${chapters[(currentPage - 1) * 2 + 1].color}12 0%, #0c0b0a 100%)`,
              }}
            >
               {currentPage === 5 ? (
                <div className="flex flex-col justify-between h-full items-center text-center relative z-10 select-none">
                  <div className="my-auto space-y-6">
                    <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#ff7b00]">The End</span>
                    <h3 className="font-display font-black text-2xl text-white">THANK YOU FOR READING</h3>
                    <button
                      onClick={handleCloseBook}
                      className="px-5 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-[10px] font-bold text-orange-400 hover:bg-orange-500 hover:text-black hover:shadow-[0_0_12px_rgba(255,123,0,0.4)] cursor-pointer transition-all duration-300 uppercase tracking-widest"
                    >
                      Close Journal ↩
                    </button>
                  </div>
                  <div className="text-[11px] text-white/40 font-mono">Page 10</div>
                </div>
               ) : (
                 <ChapterPageContent
                   chapterIndex={(currentPage - 1) * 2 + 1}
                   eli5Mode={eli5Mode}
                   isVisible={isOpen && currentPage >= 1 && currentPage <= 4}
                 />
               )}

               {/* Tactile Page Curl */}
               {currentPage < 5 && (
                 <PageCornerCurl isLeft={false} onClick={handleNext} />
               )}
            </div>
          </motion.div>
        )}

        {/* Animated Bookmark Ribbon on Desktop */}
        {isOpen && (
          <motion.div
            animate={{ top: bookmarkTop }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="absolute right-[-8px] w-3.5 h-16 bg-gradient-to-b from-harvest-orange to-gold rounded-r-md shadow-[2px_0_10px_rgba(255,123,0,0.4)] z-30 flex items-center justify-center pointer-events-none"
          >
            <span className="w-[1.5px] h-10 bg-white/30 rounded" />
          </motion.div>
        )}
      </div>

      {isOpen && (
        <div className="flex items-center gap-6">
          <button onClick={handlePrev} className="p-3.5 rounded-full border border-white/10 text-white hover:text-orange-400 cursor-pointer bg-transparent transition-all duration-300"><ChevronLeft className="w-5 h-5" /></button>
          <span className="text-xs font-mono text-white/50">{currentPage} / 5 spreads</span>
          <button onClick={() => setIsAutoplay(!isAutoplay)} className="px-3 py-1.5 rounded-full border border-white/10 text-[10px] uppercase font-bold text-white hover:border-orange-400 cursor-pointer bg-transparent transition-all duration-300">{isAutoplay ? 'Pause' : 'Auto'}</button>
          <button onClick={handleNext} className="p-3.5 rounded-full border border-white/10 text-white hover:text-orange-400 cursor-pointer bg-transparent transition-all duration-300"><ChevronRight className="w-5 h-5" /></button>
        </div>
      )}
    </div>
  );

  return (
    <section id="skills-section" className="relative py-24 px-6 md:px-20 overflow-hidden bg-black" onMouseEnter={() => markSectionVisited('skills')}>
      {/* Atmospheric Background Layer (Spotlight glow, vignette, particle depth-field & ambient gradient mesh) */}
      <SkillsAtmosphericBackground />

      {/* Background Parallax Particles */}
      {isOpen && <ParallaxParticles currentPage={currentPage} />}
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-12">
          <h2 className="font-display font-black text-4xl sm:text-5xl text-white">Technical Skills</h2>
          <div className="w-16 h-1 bg-linear-to-r from-harvest-orange to-gold mt-4 rounded-full"></div>
        </div>
        {isMobile ? renderMobile() : renderDesktop()}
      </div>
    </section>
  );
};

export default SkillsStorybook;
