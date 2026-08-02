import React from 'react';
import { ChevronUp, Mail } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from './Icons';
import sound from '../utils/sound';
import { usePortfolio } from '../context/PortfolioContext';

const Footer: React.FC = () => {
  const { visitorCount } = usePortfolio();

  const handleScrollToTop = () => {
    sound.playClick();
    const el = document.getElementById('hero');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLinkClick = (id: string) => {
    sound.playClick();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: 'About', id: 'about-section' },
    { label: 'Skills', id: 'skills-section' },
    { label: 'Hackathons', id: 'hackathons-section' },
    { label: 'Projects', id: 'projects-section' },
    { label: 'Certificates', id: 'certificates-section' },
    { label: 'Contact', id: 'contact-section' },
  ];

  const socials = [
    { icon: LinkedinIcon, url: 'https://www.linkedin.com/in/krishnam-gupta-65b223389/' },
    { icon: Mail, url: 'mailto:krishnamgupta18@gmail.com' },
    { icon: GithubIcon, url: 'https://github.com/krishnamgupta29' },
  ];

  return (
    <footer className="relative bg-[#090909] border-t border-white/5 py-12 px-6 sm:px-12 md:px-20 lg:px-32 xl:px-40 font-sans z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left Side: Copyright branding & Live Visitor Counter */}
        <div className="text-center md:text-left space-y-2">
          <h4 className="font-display font-bold text-lg text-white">
            Krishnam Gupta
          </h4>
          <p className="text-[11px] sm:text-xs text-white/40 leading-relaxed max-w-sm">
            © 2026 Krishnam Gupta | Tech Portfolio <br className="sm:hidden" />
            Built with React + Vite + Tailwind CSS + Framer Motion + Three.js
          </p>
          {/* Live Visitor Counter */}
          <div className="flex items-center justify-center md:justify-start gap-2 pt-1 select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-harvest-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-harvest-orange"></span>
            </span>
            <span className="text-[10px] font-mono text-white/50 dark:text-white/50 light:text-black/50">
              <span className="text-gold font-bold">{visitorCount}</span> explorers have navigated here
            </span>
          </div>
        </div>

        {/* Middle: Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 max-w-md">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className="text-xs text-white/50 hover:text-harvest-orange transition-colors cursor-pointer bg-transparent border-0"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right Side: Social icons & back-to-top */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Social icons */}
          <div className="flex gap-4">
            {socials.map((social, idx) => {
              const Icon = social.icon;
              return (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  className="text-white/40 hover:text-harvest-orange transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>

          {/* Back to top */}
          <button
            onClick={handleScrollToTop}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-black hover:bg-linear-to-r hover:from-harvest-orange hover:to-gold hover:border-transparent transition-all flex items-center justify-center cursor-pointer shadow-md"
            title="Back to Top"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
