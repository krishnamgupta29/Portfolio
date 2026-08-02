import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Analytics } from '@vercel/analytics/react';

// Import UI elements
import NoiseOverlay from './components/NoiseOverlay';
import CustomCursor from './components/CustomCursor';
import IntroLoader from './components/IntroLoader';
import Navbar from './components/Navbar';
import AIChatWidget from './components/AIChatWidget';
import TerminalEasterEgg from './components/TerminalEasterEgg';
import VisitorPersonalizer from './components/VisitorPersonalizer';
import AchievementTray from './components/AchievementTray';
import AchievementToast from './components/AchievementToast';

// Import Section components
import Hero from './components/Hero';
import About from './components/About';
import SkillsStorybook from './components/SkillsStorybook';
import GithubGraph from './components/GithubGraph';
import HackathonsGallery from './components/HackathonsGallery';
import ProjectsGrid from './components/ProjectsGrid';
import CertificateDeck from './components/CertificateDeck';
import MiniArcade from './components/MiniArcade';
import Guestbook from './components/Guestbook';
import BehindTheScenes from './components/BehindTheScenes';
import Contact from './components/Contact';
import Footer from './components/Footer';

// Context provider
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';

gsap.registerPlugin(ScrollTrigger);

const AppContent: React.FC = () => {
  const [isLoaderFinished, setIsLoaderFinished] = useState<boolean>(false);
  const { visitorType, unlockBadge, markSectionVisited } = usePortfolio();

  // Initialize Lenis smooth scroll and GSAP tickers
  useEffect(() => {
    if (!isLoaderFinished) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    (window as any).lenis = lenis;

    // Update ScrollTrigger on scroll
    lenis.on('scroll', ScrollTrigger.update);

    // Sync GSAP ticker with Lenis raf
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Clean up
    return () => {
      (window as any).lenis = null;
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, [isLoaderFinished]);

  // Gamification: Unique visit (Regular badge trigger)
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('has-visited-space');
    if (hasVisitedBefore === 'true') {
      const timer = setTimeout(() => {
        unlockBadge('regular');
      }, 3500);
      return () => clearTimeout(timer);
    } else {
      localStorage.setItem('has-visited-space', 'true');
    }
  }, [unlockBadge]);

  // Tab Title Animation on Visibility Change
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        let toggle = false;
        interval = setInterval(() => {
          document.title = toggle ? "👋 Still here?" : "Krishnam Gupta ⚡";
          toggle = !toggle;
        }, 2000);
      } else {
        clearInterval(interval);
        document.title = "Krishnam Gupta";
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  // Global Section Heading Reveal Wipe Intersection Observer
  useEffect(() => {
    if (!isLoaderFinished) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.15 });

    const targets = document.querySelectorAll('.reveal-wipe-container');
    targets.forEach((t) => observer.observe(t));

    return () => observer.disconnect();
  }, [isLoaderFinished]);

  // Gamification: Intersection observer to track section scroll entries
  useEffect(() => {
    if (!isLoaderFinished) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id === 'about-section') markSectionVisited('about');
          else if (id === 'skills-section') markSectionVisited('skills');
          else if (id === 'hackathons-section') markSectionVisited('hackathons');
          else if (id === 'projects-section') markSectionVisited('projects');
          else if (id === 'certificates-section') markSectionVisited('certificates');
          else if (id === 'arcade-section') markSectionVisited('arcade');
          else if (id === 'guestbook-section') markSectionVisited('guestbook');
          else if (id === 'contact-section') markSectionVisited('contact');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const targetIds = [
      'about-section',
      'skills-section',
      'hackathons-section',
      'projects-section',
      'certificates-section',
      'arcade-section',
      'guestbook-section',
      'contact-section',
    ];

    targetIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [isLoaderFinished, markSectionVisited]);

  // Section list to allow dynamic reordering based on visitor persona
  const sectionMap: Record<string, React.ReactNode> = {
    about: <About key="about" />,
    skills: <SkillsStorybook key="skills" />,
    hackathons: <HackathonsGallery key="hackathons" />,
    projects: <React.Fragment key="projects"><ProjectsGrid /><GithubGraph /></React.Fragment>,
    certificates: <CertificateDeck key="certificates" />,
    arcade: <MiniArcade key="arcade" />,
    devnotes: <BehindTheScenes key="devnotes" />,
    contact: <Contact key="contact" />,
    guestbook: <Guestbook key="guestbook" />,
  };

  // Reorder sections based on selected Visitor Type
  // Flow: Impress → Prove → Validate → Engage → Convert
  const getSectionOrder = (): string[] => {
    switch (visitorType) {
      case 'recruiter':
        return ['about', 'certificates', 'skills', 'projects', 'hackathons', 'arcade', 'devnotes', 'contact', 'guestbook'];
      case 'judge':
        return ['about', 'hackathons', 'projects', 'skills', 'certificates', 'arcade', 'devnotes', 'contact', 'guestbook'];
      case 'student':
        return ['about', 'skills', 'projects', 'hackathons', 'arcade', 'certificates', 'devnotes', 'contact', 'guestbook'];
      default:
        // Default: Impress → Prove → Validate → Engage → Convert
        return ['about', 'skills', 'hackathons', 'projects', 'certificates', 'arcade', 'devnotes', 'contact', 'guestbook'];
    }
  };

  const sectionsToRender = getSectionOrder();

  return (
    <>
      {/* Background overlays, cursor, tilde CLI terminal, and badges */}
      <NoiseOverlay />
      <div className="nav-sweep-overlay" aria-hidden="true" />
      <CustomCursor />
      <TerminalEasterEgg />
      <AchievementTray />
      <AchievementToast />
      
      {/* Initial load sequence */}
      {!isLoaderFinished && (
        <IntroLoader onComplete={() => setIsLoaderFinished(true)} />
      )}

      {/* Main Portfolio contents (rendered once loader completes) */}
      <div className={`transition-opacity duration-1000 ${isLoaderFinished ? 'opacity-100' : 'opacity-0'}`}>
        {isLoaderFinished && (
          <>
            <Navbar />
            
            <main className="relative z-10 w-full overflow-hidden">
              <Hero />
              
              {/* Dynamically reorderable sections based on visitorType */}
              {sectionsToRender.map((secKey) => sectionMap[secKey])}
            </main>
            
            <Footer />
            <AIChatWidget />
            <VisitorPersonalizer />
          </>
        )}
      </div>
    </>
  );
};

const App: React.FC = () => (
  <PortfolioProvider>
    <AppContent />
    <Analytics />
  </PortfolioProvider>
);

export default App;
