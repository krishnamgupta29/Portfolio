import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Menu, X, Download } from 'lucide-react';
import sound from '../utils/sound';
import { usePortfolio } from '../context/PortfolioContext';
import { generateResumePDF } from '../utils/resumeGenerator';

const Navbar: React.FC = () => {
  const { eli5Mode, unlockBadge } = usePortfolio();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Sync scroll state for shrink effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Section highlighters
      const sections = ['hero', 'about-section', 'skills-section', 'hackathons-section', 'projects-section', 'certificates-section', 'arcade-section', 'contact-section'];
      let active = 'hero';
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            active = id;
          }
        }
      });
      setActiveSection(active);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync initial sound & theme state
  useEffect(() => {
    setIsMuted(sound.isMuted());
    const unsub = sound.subscribe((muted) => setIsMuted(muted));

    return unsub;
  }, []);



  // Toggle Sound Mute
  const toggleMute = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      sound.playClick();
    }
  };

  const handleLinkClick = (id: string) => {
    sound.playClick();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const targetScroll = element.getBoundingClientRect().top + window.scrollY;
      const direction = targetScroll > window.scrollY ? 'nav-sweep-down' : 'nav-sweep-up';
      document.body.classList.remove('nav-sweep-down', 'nav-sweep-up');
      document.body.classList.add(direction);
      setTimeout(() => document.body.classList.remove(direction), 900);
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: 'About', id: 'about-section' },
    { label: 'Skills', id: 'skills-section' },
    { label: 'Hackathons', id: 'hackathons-section' },
    { label: 'Projects', id: 'projects-section' },
    { label: 'Certificates', id: 'certificates-section' },
    { label: 'Arcade', id: 'arcade-section' },
    { label: 'Contact', id: 'contact-section' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-45 transition-all duration-300 ${
        isScrolled
          ? 'py-3 bg-black/60 dark:bg-black/60 light:bg-white/60 backdrop-blur-xl border-b border-white/5 shadow-lg'
          : 'py-6 bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleLinkClick('hero')}
          className="flex items-center gap-1 font-display font-bold text-xl tracking-tight text-white dark:text-white light:text-black hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-0"
        >
          Krishnam Gupta
          <span className="w-1.5 h-1.5 rounded-full bg-harvest-orange animate-pulse"></span>
        </button>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`nav-dot font-sans text-sm font-medium tracking-wide transition-colors cursor-pointer bg-transparent border-0 ${
                  activeSection === link.id
                    ? 'text-harvest-orange active'
                    : 'text-white/60 dark:text-white/60 light:text-black/60 hover:text-white dark:hover:text-white light:hover:text-black'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Action Panel */}
          <div className="flex items-center gap-4 pl-4 border-l border-white/10 dark:border-white/10 light:border-black/10">
            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              className="p-2 rounded-full hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-black/5 text-white/70 dark:text-white/70 light:text-black/70 hover:text-white dark:hover:text-white light:hover:text-black cursor-pointer transition-colors bg-transparent border-0"
              title={isMuted ? 'Unmute UI Sound' : 'Mute UI Sound'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Resume Button */}
            <button
              onClick={() => {
                sound.playClick();
                generateResumePDF(eli5Mode);
                unlockBadge('recruiter');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-harvest-orange to-gold text-black font-semibold text-xs tracking-wider uppercase shadow-md shadow-harvest-orange/15 hover:shadow-harvest-orange/30 hover:scale-105 active:scale-95 cursor-pointer border-0 transition-all duration-300"
            >
              <Download className="w-3.5 h-3.5" />
              Resume
            </button>
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-3">
          {/* Audio */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-full text-white dark:text-white light:text-black bg-transparent border-0"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Menu */}
          <button
            onClick={() => {
              sound.playClick();
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            className="p-2 rounded-full text-white dark:text-white light:text-black bg-transparent border-0"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-[57px] left-0 w-full bg-black/95 dark:bg-black/95 light:bg-[#f7f5f0]/95 backdrop-blur-2xl border-b border-white/5 py-6 px-8 flex flex-col gap-6 shadow-2xl z-40 transition-all duration-300">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`text-left font-display font-medium text-lg cursor-pointer bg-transparent border-0 ${
                  activeSection === link.id
                    ? 'text-harvest-orange'
                    : 'text-white/70 dark:text-white/70 light:text-black/70'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              sound.playClick();
              generateResumePDF(eli5Mode);
              unlockBadge('recruiter');
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-linear-to-r from-harvest-orange to-gold text-black font-bold text-sm tracking-widest uppercase border-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Resume
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
