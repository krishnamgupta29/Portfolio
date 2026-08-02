import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Code2,
  ExternalLink,
  Eye,
  Brain,
  Box,
  Lock,
  FileText,
  MessageSquare,
  Users,
  Zap,
  Shield,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Globe,
  Activity,
  X
} from 'lucide-react';
import { GithubIcon } from './Icons';
import MagneticCard from './MagneticCard';
import sound from '../utils/sound';

interface Project {
  id: number;
  title: string;
  tagline: string;
  desc: string;
  longDesc?: string;
  tags: string[];
  github: string;
  demo?: string;
  gradient: string;
  category: 'AI-ML' | 'Full-Stack' | 'Web';
  fallbackScreenshot?: string;
  isComingSoon?: boolean;
  features?: { icon: string; title: string; text: string }[];
  techStack?: { category: string; tags: string[] }[];
  metricsTable?: { headers: string[]; rows: string[][] };
  detailedMetrics?: { title: string; stats: string[] }[];
  vision?: string;
}

const projectsList: Project[] = [
  {
    id: 1,
    title: 'NeuroAssist',
    tagline: 'AI-Powered Neurological Disorder Detection, Classification & Assessment',
    desc: 'An intelligent AI diagnostics assistant built to analyze and track cognitive health patterns.',
    longDesc: 'A deep learning system that analyzes T1-weighted MRI brain scans to detect and classify neurological conditions across three categories: CN (Cognitively Normal — healthy brain function), MCI (Mild Cognitive Impairment — early-stage cognitive decline), and AD (Alzheimer\'s Disease — diagnosed dementia).',
    tags: ['AI/ML', 'Python', 'React', 'Healthcare', 'MedicalNet', 'Deep Learning'],
    github: 'https://github.com/krishnamgupta29/neuroassist-',
    demo: 'https://neuroassist-ten.vercel.app/',
    gradient: 'from-[#ff7b00] to-[#ffa200]',
    category: 'AI-ML',
    fallbackScreenshot: '/projects/neuroassist_preview.png',
    metricsTable: {
      headers: ['Task', 'Accuracy', 'AUC', 'F1-Score', 'Status'],
      rows: [
        ['Binary (CN vs AD)', '87.00%', '0.9231', '0.8571', '✅ Clinical Grade'],
        ['Multi-Class', '72.41%', '0.8234', '0.7156', '✅ Strong']
      ]
    },
    detailedMetrics: [
      {
        title: 'Binary Classification (CN vs AD)',
        stats: [
          'Precision (CN): 92.31%',
          'Recall (CN): 92.31%',
          'Precision (AD): 66.67%',
          'Recall (AD): 66.67%',
          'Confusion Matrix: Correctly identified 12/13 CN and 1/2 AD samples'
        ]
      },
      {
        title: 'Multi-Class (CN vs MCI vs AD)',
        stats: [
          'CN: 83% F1-Score (high reliability)',
          'MCI: 70% F1-Score (effective early detection)',
          'AD: 56% F1-Score (distinguishable from MCI)'
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Unseen',
    tagline: 'Say what you can\'t say.',
    desc: 'A privacy-first anonymous social network where users can express ideas and thoughts freely.',
    longDesc: 'UNSEEN is a modern anonymous social platform where users can freely express thoughts, emotions, confessions, and ideas without revealing their identity. Built with a dark cyber-inspired aesthetic, real-time interactions, encrypted messaging, and a privacy-first approach — UNSEEN creates a safe space for authentic conversations.',
    tags: ['React', 'Node.js', 'MongoDB', 'Socket.io', 'Real-Time'],
    github: 'https://github.com/krishnamgupta29/unseen',
    demo: 'https://unseen-world.vercel.app/',
    gradient: 'from-[#ff8800] to-[#ffb700]',
    category: 'Full-Stack',
    fallbackScreenshot: '/projects/unseen_preview.png',
    features: [
      { icon: 'Lock', title: 'Anonymous Identity System', text: 'privacy-first UX, auto-generated random usernames, real identity never exposed, optional email for recovery, custom display names, editable bio' },
      { icon: 'FileText', title: 'Anonymous Feed', text: 'text-based posts, confessions/thoughts sharing, clean distraction-free feed, real-time updates, trending topics, like/save/comment/share' },
      { icon: 'MessageSquare', title: 'Real-Time Messaging', text: 'one-to-one messaging, message reactions, message deletion, socket-powered real-time updates, mobile-friendly chat' },
      { icon: 'Users', title: 'Social Features', text: 'follow/unfollow, followers & following system, profile pages, user search, saved posts, activity tracking' },
      { icon: 'Zap', title: 'Real-Time Experience', text: 'instant interactions, live comment updates, real-time follow counts, optimistic UI updates' },
      { icon: 'Shield', title: 'Security & Privacy', text: 'bcrypt password hashing, JWT authentication, protected API routes, MongoDB data security, anonymous-first architecture' },
      { icon: 'Smartphone', title: 'Mobile & APK Support', text: 'fully responsive, Android APK support, mobile-first native-like experience, dark cyberpunk theme' }
    ],
    techStack: [
      { category: 'Frontend', tags: ['React.js', 'Vite', 'Tailwind CSS', 'Framer Motion', 'React Router', 'Socket.io Client'] },
      { category: 'Backend', tags: ['Node.js', 'Express.js', 'Socket.io', 'JWT Authentication', 'Bcrypt'] },
      { category: 'Database', tags: ['MongoDB', 'Mongoose'] },
      { category: 'Deployment', tags: ['Vercel (Frontend)', 'Render (Backend)', 'MongoDB Atlas (Database)'] }
    ],
    vision: 'UNSEEN aims to become a safe digital space where people can share thoughts, emotions, experiences, and ideas without social pressure or identity concerns — a community-driven anonymous platform that encourages genuine expression, meaningful conversations, and privacy-first interactions.'
  },
  {
    id: 3,
    title: 'Creative Portfolio',
    tagline: 'My premium, award-winning 3D interactive personal portfolio featuring modular systems and game modules.',
    desc: 'My premium, award-winning 3D interactive personal portfolio featuring modular systems and game modules.',
    longDesc: 'This very site — a fully interactive, 3D-enhanced personal portfolio built to showcase my work as an AI/ML developer, featuring a skill storybook, live achievements, mini-games, and more.',
    tags: ['React', 'Vite', 'R3F', 'Framer Motion'],
    github: 'https://github.com/krishnamgupta29/Portfolio',
    gradient: 'from-[#ff9500] to-[#ffd000]',
    category: 'Web',
    isComingSoon: true,
    fallbackScreenshot: '/projects/portfolio_preview.png'
  }
];

const ProjectsGrid: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'live' | 'screenshot'>('live');
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const shouldReduceMotion = useReducedMotion();

  // Escape key listener for closing modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };
    if (activeProject) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProject]);

  // Lock body scroll and Lenis scroll when activeProject is open
  useEffect(() => {
    const lenis = (window as any).lenis;
    if (activeProject) {
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    } else {
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    }
    return () => {
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    };
  }, [activeProject]);

  const handleOpenModal = (project: Project) => {
    sound.playClick();
    setActiveProject(project);
    setViewMode(project.isComingSoon ? 'screenshot' : 'live');
    setIframeLoading(true);
    setDetailsOpen(false);
  };

  const handleCloseModal = () => {
    sound.playClick();
    setActiveProject(null);
  };

  const getDisplayUrl = (project: Project) => {
    if (project.isComingSoon || !project.demo) {
      return `${project.title.toLowerCase().replace(/\s+/g, '-')}.local`;
    }
    return project.demo.replace(/^https?:\/\//, '').replace(/\/$/, '');
  };

  const renderAnimatedIcon = (id: number) => {
    if (id === 1) {
      return (
        <motion.div
          animate={shouldReduceMotion ? {} : { scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <Brain className="w-5 h-5 text-harvest-orange" />
        </motion.div>
      );
    }
    if (id === 2) {
      return (
        <motion.div
          animate={shouldReduceMotion ? {} : { opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <Eye className="w-5 h-5 text-harvest-orange" />
        </motion.div>
      );
    }
    if (id === 3) {
      return (
        <motion.div
          animate={shouldReduceMotion ? {} : { rotate: 360 }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        >
          <Box className="w-5 h-5 text-harvest-orange" />
        </motion.div>
      );
    }
    return <Code2 className="w-5 h-5 text-harvest-orange" />;
  };

  const getFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'Lock': return <Lock className="w-4 h-4 text-harvest-orange" />;
      case 'FileText': return <FileText className="w-4 h-4 text-harvest-orange" />;
      case 'MessageSquare': return <MessageSquare className="w-4 h-4 text-harvest-orange" />;
      case 'Users': return <Users className="w-4 h-4 text-harvest-orange" />;
      case 'Zap': return <Zap className="w-4 h-4 text-harvest-orange" />;
      case 'Shield': return <Shield className="w-4 h-4 text-harvest-orange" />;
      case 'Smartphone': return <Smartphone className="w-4 h-4 text-harvest-orange" />;
      default: return <Code2 className="w-4 h-4 text-harvest-orange" />;
    }
  };

  const filteredProjects = selectedCategory === 'All'
    ? projectsList
    : projectsList.filter((p) => p.category === selectedCategory);

  return (
    <section
      id="projects-section"
      className="relative py-24 px-6 sm:px-12 md:px-20 lg:px-32 xl:px-40 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-left">
          <motion.h2
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white dark:text-white light:text-black tracking-tight"
          >
            Featured Projects
          </motion.h2>
          <div className="w-16 h-1 bg-linear-to-r from-harvest-orange to-gold mt-4 rounded-full"></div>
        </div>

        {/* Category Filter Bar */}
        <div className="mb-12 flex flex-wrap gap-2.5 justify-start items-center">
          {['All', 'AI-ML', 'Full-Stack', 'Web'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-linear-to-r from-harvest-orange to-gold text-black border-transparent shadow-[0_0_12px_rgba(255,123,0,0.3)] scale-105'
                  : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border-white/5 hover:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout={!shouldReduceMotion}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.4, delay: index * 0.05 }}
                className="h-full"
              >
                <MagneticCard maxTilt={8} maxPull={6} className="h-full">
                  <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between h-[420px] p-6 text-left group relative border border-white/5 dark:border-white/5 light:border-black/5 hover:border-harvest-orange/30 hover:-translate-y-1.5 hover:shadow-[0_0_30px_rgba(255,123,0,0.12)] transition-all duration-300 interactive-card">
                    
                    {/* Glowing hover background element */}
                    <div className="absolute inset-0 bg-gradient-to-br from-harvest-orange/5 to-gold/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Card Body */}
                    <div className="space-y-4 z-10 flex-1">
                      {/* Visual Gradient Header (Clicking opens case study modal) */}
                      <div
                        onClick={() => handleOpenModal(project)}
                        className={`w-full h-32 rounded-xl bg-linear-to-br ${project.gradient} p-4 flex items-end justify-start shadow-md shadow-black/20 relative overflow-hidden group/thumb cursor-pointer`}
                      >
                        {/* Shimmer sweep effect */}
                        <div className="absolute inset-0 w-[200%] h-full bg-linear-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-150%] group-hover/thumb:translate-x-[150%] transition-transform duration-1000 ease-out pointer-events-none" />

                        {/* View Case Study Overlay */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                          <span className="bg-black/70 backdrop-blur-md text-white border border-white/10 px-3 py-1.5 rounded-lg font-display font-bold text-[10px] uppercase tracking-wider">
                            View Case Study →
                          </span>
                        </div>

                        {/* Custom Animated Icon */}
                        <div className="p-2 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 absolute bottom-4 left-4 z-10">
                          {renderAnimatedIcon(project.id)}
                        </div>
                      </div>

                      <h3
                        onClick={() => handleOpenModal(project)}
                        className="font-display font-bold text-xl text-white dark:text-white light:text-black group-hover:text-harvest-orange transition-colors cursor-pointer"
                      >
                        {project.title}
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-white/60 dark:text-white/60 light:text-black/60 font-sans leading-relaxed line-clamp-3">
                        {project.desc}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-6 flex flex-col gap-4 z-10">
                      {/* Tech Badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-display font-semibold uppercase tracking-widest px-2.5 py-1 rounded-md bg-white/5 dark:bg-white/5 light:bg-black/3 border border-white/5 dark:border-white/5 light:border-black/5 text-white/50 dark:text-white/50 light:text-black/50"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Dual Action Buttons */}
                      <div className="flex gap-2.5">
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => sound.playClick()}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white dark:text-white light:text-black font-semibold text-xs tracking-wider uppercase transition-all duration-300"
                        >
                          <GithubIcon className="w-3.5 h-3.5" />
                          Code
                        </a>
                        {project.demo ? (
                          <a
                            href={project.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => sound.playClick()}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-linear-to-r from-harvest-orange to-gold text-black font-semibold text-xs tracking-wider uppercase transition-all duration-300 hover:shadow-[0_0_12px_rgba(255,123,0,0.35)]"
                          >
                            Demo
                          </a>
                        ) : (
                          <button
                            disabled
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/30 dark:text-white/30 light:text-black/30 font-semibold text-xs tracking-wider uppercase cursor-not-allowed"
                          >
                            Soon
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </MagneticCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Case Study Live Preview Modal rendered as a high z-index React Portal directly under body */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activeProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
              style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}
              onClick={handleCloseModal}
            >
              <motion.div
                initial={shouldReduceMotion ? { scale: 0.95 } : { scale: 0.9, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={shouldReduceMotion ? { scale: 0.95 } : { scale: 0.9, y: 30, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full max-w-5xl bg-[#0f0f0f] border border-white/10 rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col shadow-2xl relative h-[95vh] md:max-h-[90vh]"
                style={{ overscrollBehavior: 'contain' }}
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                {/* macOS Style Sticky Mini-Browser Window Top Bar */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#161616] shrink-0 z-30">
                  {/* macOS red, yellow, green window controls */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={handleCloseModal}
                      className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 cursor-pointer transition-colors"
                      title="Close"
                    />
                    <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f]" />
                  </div>

                  {/* URL Bar */}
                  <div className="flex-1 max-w-xl mx-4 px-4 py-1.5 rounded-lg bg-black/50 border border-white/5 text-[11px] text-white/50 font-mono text-center flex items-center justify-center gap-1.5 truncate">
                    <Globe className="w-3.5 h-3.5 text-white/40 shrink-0" />
                    <span className="truncate">
                      {getDisplayUrl(activeProject)}
                    </span>
                    {activeProject.demo && !activeProject.isComingSoon && (
                      <button
                        onClick={() => setViewMode(viewMode === 'live' ? 'screenshot' : 'live')}
                        className="ml-auto text-[9px] font-sans font-bold uppercase tracking-wider text-harvest-orange hover:underline cursor-pointer"
                      >
                        {viewMode === 'live' ? 'Show Screenshot' : 'Show Live Link'}
                      </button>
                    )}
                  </div>

                  {/* Top Bar Actions */}
                  <div className="flex items-center gap-3">
                    {activeProject.demo && !activeProject.isComingSoon ? (
                      <a
                        href={activeProject.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all"
                        title="Open in New Tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <button
                        disabled
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                        title="Coming Soon"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={handleCloseModal}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all cursor-pointer text-xs font-display font-semibold uppercase tracking-wider"
                    >
                      <X className="w-3.5 h-3.5" /> Close
                    </button>
                  </div>
                </div>

                {/* Iframe Viewport or Fallback Screenshot */}
                <div className="relative w-full h-[40vh] md:h-[55vh] min-h-[250px] bg-black border-b border-white/10 overflow-hidden shrink-0 z-20">
                  {/* Loader Overlay for live site */}
                  {iframeLoading && viewMode === 'live' && !activeProject.isComingSoon && (
                    <div className="absolute inset-0 bg-[#0c0c0c] flex flex-col justify-center items-center gap-3 z-20">
                      <div className="w-10 h-10 border-4 border-harvest-orange/30 border-t-harvest-orange rounded-full animate-spin" />
                      <span className="text-[10px] font-display font-bold uppercase tracking-widest text-white/50">Loading Live Site...</span>
                    </div>
                  )}

                  {activeProject.isComingSoon || viewMode === 'screenshot' ? (
                    <div className="relative w-full h-full">
                      <img
                        src={activeProject.fallbackScreenshot}
                        alt={`Krishnam Gupta - ${activeProject.title} project screenshot`}
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-black/30 to-transparent flex flex-col justify-end p-8 text-left">
                        <div className="max-w-2xl bg-black/60 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                          <span className="text-[9px] font-display font-bold uppercase tracking-widest text-harvest-orange px-2 py-0.5 rounded bg-harvest-orange/15 border border-harvest-orange/20 inline-block mb-3">
                            {activeProject.isComingSoon ? "Coming Soon" : "Static Preview Mode"}
                          </span>
                          <h4 className="text-xl font-display font-black text-white mb-2 leading-tight">{activeProject.tagline}</h4>
                          <p className="text-[11px] text-white/60 mb-4 font-sans leading-relaxed">
                            {activeProject.isComingSoon
                              ? "This premium interactive portfolio is currently running. The full live embedded preview sandbox will be activated post deployment."
                              : "This live website restricts frame embedding. Please click Launch Full Site to interact with the deployed live web app directly."}
                          </p>
                          {activeProject.demo && !activeProject.isComingSoon && (
                            <a
                              href={activeProject.demo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-harvest-orange to-gold text-black rounded-lg text-xs font-display font-bold uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                              Launch Full Site <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      src={activeProject.demo}
                      className="w-full h-full border-0 bg-white"
                      title={activeProject.title}
                      onLoad={() => setIframeLoading(false)}
                    />
                  )}
                </div>

                {/* Case Study Details Panel - Scrollable section */}
                <div
                  className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-6"
                  style={{ overscrollBehavior: 'contain' }}
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  {/* Header with Title and Quick Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
                    <div className="text-left">
                      <span className="text-[10px] font-display font-bold uppercase tracking-widest text-harvest-orange">{activeProject.category} Project</span>
                      <h3 className="font-display font-black text-2xl text-white mt-1">{activeProject.title}</h3>
                      <p className="text-xs text-white/50 font-sans mt-0.5">{activeProject.tagline}</p>
                    </div>
                    
                    <div className="flex gap-3 w-full sm:w-auto shrink-0">
                      <a
                        href={activeProject.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => sound.playClick()}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold text-xs tracking-wider uppercase transition-all"
                      >
                        <GithubIcon className="w-4 h-4" /> Code
                      </a>
                      {activeProject.demo && !activeProject.isComingSoon ? (
                        <a
                          href={activeProject.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => sound.playClick()}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-linear-to-r from-harvest-orange to-gold text-black font-semibold text-xs tracking-wider uppercase hover:shadow-[0_0_12px_rgba(255,123,0,0.35)] transition-all"
                        >
                          Launch Full Site <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <button
                          disabled
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/30 font-semibold text-xs tracking-wider uppercase cursor-not-allowed"
                        >
                          Coming Soon
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Core Overview Description */}
                  <div className="text-left">
                    <p className="text-sm text-white/80 leading-relaxed font-sans">
                      {activeProject.longDesc || activeProject.desc}
                    </p>
                  </div>

                  {/* Collapsible Accordion Case Study Panel */}
                  <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/20">
                    <button
                      onClick={() => setDetailsOpen(!detailsOpen)}
                      className="w-full px-6 py-4 bg-white/2 hover:bg-white/5 flex items-center justify-between text-white hover:text-harvest-orange transition-colors cursor-pointer"
                    >
                      <span className="font-display font-bold text-xs uppercase tracking-widest">Case Study & Technical Specifications</span>
                      {detailsOpen ? <ChevronUp className="w-4 h-4 text-harvest-orange" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                    </button>

                    <AnimatePresence initial={false}>
                      {detailsOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden bg-black/30 border-t border-white/5"
                        >
                          <div className="p-6 space-y-8 text-left">
                            {/* Features Section */}
                            {activeProject.features && (
                              <div className="space-y-4">
                                <h4 className="font-display font-bold text-[10px] uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Key Core Features</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {activeProject.features.map((feat, idx) => (
                                    <div key={idx} className="flex gap-3 items-start p-3.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/3 transition-all">
                                      <div className="p-2 rounded-lg bg-harvest-orange/10 border border-harvest-orange/20 text-harvest-orange shrink-0">
                                        {getFeatureIcon(feat.icon)}
                                      </div>
                                      <div>
                                        <h5 className="font-display font-bold text-xs text-white mb-0.5">{feat.title}</h5>
                                        <p className="text-[10px] text-white/60 font-sans leading-relaxed">{feat.text}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Metrics Table Section */}
                            {activeProject.metricsTable && (
                              <div className="space-y-4">
                                <h4 className="font-display font-bold text-[10px] uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Performance Metrics (MedicalNet)</h4>
                                <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/2 p-4">
                                  <table className="w-full text-left font-sans text-xs">
                                    <thead>
                                      <tr className="border-b border-white/10 text-white/50">
                                        {activeProject.metricsTable.headers.map((h) => (
                                          <th key={h} className="pb-2 font-display uppercase tracking-wider font-semibold text-[10px]">{h}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {activeProject.metricsTable.rows.map((row, rIdx) => (
                                        <tr key={rIdx} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                                          {row.map((cell, cIdx) => (
                                            <td key={cIdx} className="py-2.5 text-white font-medium">{cell}</td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Detailed Confusion Matrix */}
                            {activeProject.detailedMetrics && (
                              <div className="space-y-4">
                                <h4 className="font-display font-bold text-[10px] uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Detailed Confusion Matrix & Recall Specs</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {activeProject.detailedMetrics.map((block, idx) => (
                                    <div key={idx} className="p-4 rounded-xl border border-white/5 bg-white/2 flex flex-col justify-between">
                                      <div>
                                        <div className="flex items-center gap-2 mb-2 text-harvest-orange">
                                          <Activity className="w-4 h-4" />
                                          <span className="font-display font-bold text-xs uppercase tracking-wider">{block.title}</span>
                                        </div>
                                        <ul className="space-y-1.5 text-white/70 font-sans text-[11px] list-disc list-inside">
                                          {block.stats.map((stat, sIdx) => (
                                            <li key={sIdx}>{stat}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Technical Stack Tag Clusters */}
                            {activeProject.techStack && (
                              <div className="space-y-4">
                                <h4 className="font-display font-bold text-[10px] uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Architecture & Deployment Stack</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                  {activeProject.techStack.map((stack) => (
                                    <div key={stack.category} className="p-4 rounded-xl border border-white/5 bg-white/2 text-left">
                                      <span className="text-[10px] font-display font-bold uppercase tracking-widest text-harvest-orange/80 block mb-2">{stack.category}</span>
                                      <div className="flex flex-wrap gap-1.5">
                                        {stack.tags.map((t) => (
                                          <span key={t} className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded text-white/75 border border-white/5">{t}</span>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Vision Statement Quote */}
                            {activeProject.vision && (
                              <div className="space-y-4">
                                <h4 className="font-display font-bold text-[10px] uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Core Product Vision</h4>
                                <div className="p-5 rounded-2xl border-l-4 border-harvest-orange bg-harvest-orange/5 text-left italic font-sans text-xs text-white/80 leading-relaxed shadow-inner">
                                  "{activeProject.vision}"
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
};

export default ProjectsGrid;
