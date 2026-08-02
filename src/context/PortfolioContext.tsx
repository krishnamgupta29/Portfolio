import React, { createContext, useContext, useState, useEffect } from 'react';
import sound from '../utils/sound';

export type VisitorType = 'recruiter' | 'student' | 'judge' | 'browsing';

export interface Badge {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export const BADGES: Badge[] = [
  { id: 'explorer', title: '🧭 Explorer', desc: 'Visited all main sections of the universe.', icon: 'compass' },
  { id: 'signed', title: '📝 Signed In', desc: 'Left a public signature in the guestbook.', icon: 'edit' },
  { id: 'recruiter', title: '📄 Recruiter Mode', desc: 'Downloaded the master ATS resume.', icon: 'file-text' },
  { id: 'regular', title: '🔁 Regular Visitor', desc: 'Visited this space more than once.', icon: 'rotate-cw' },
  { id: 'gamer', title: '🎮 Gamer', desc: 'Played all games in the mini arcade.', icon: 'gamepad' },
];

interface PortfolioContextType {
  visitorType: VisitorType;
  setVisitorType: (type: VisitorType) => void;
  eli5Mode: boolean;
  setEli5Mode: (mode: boolean) => void;
  unlockedBadges: string[];
  unlockBadge: (id: string) => void;
  visitedSections: string[];
  markSectionVisited: (sectionId: string) => void;
  resetAchievements: () => void;
  activeToast: Badge | null;
  setActiveToast: (badge: Badge | null) => void;
  visitorCount: number;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitorType, setVisitorType] = useState<VisitorType>('browsing');
  const [eli5Mode, setEli5Mode] = useState<boolean>(false);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [visitedSections, setVisitedSections] = useState<string[]>([]);
  const [activeToast, setActiveToast] = useState<Badge | null>(null);
  const [visitorCount, setVisitorCount] = useState<number>(0);

  // Fetch / Increment visitor count (Session-based to prevent refresh inflation)
  useEffect(() => {
    const hasCountedSession = sessionStorage.getItem('portfolio-session-counted');
    const isNewSession = !hasCountedSession;

    // Use /up ONLY for new sessions; read current count on simple reloads
    const endpoint = isNewSession
      ? 'https://api.counterapi.dev/v1/krishnamgupta-portfolio-v1/visits/up'
      : 'https://api.counterapi.dev/v1/krishnamgupta-portfolio-v1/visits';

    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.count === 'number') {
          setVisitorCount(data.count);
          if (isNewSession) {
            sessionStorage.setItem('portfolio-session-counted', 'true');
          }
        }
      })
      .catch((err) => {
        console.warn('CounterAPI error, falling back to local simulation:', err);
        const localCount = localStorage.getItem('visitor-count-local');
        if (localCount) {
          const countNum = parseInt(localCount);
          const nextCount = isNewSession ? countNum + 1 : countNum;
          setVisitorCount(nextCount);
          if (isNewSession) {
            localStorage.setItem('visitor-count-local', String(nextCount));
            sessionStorage.setItem('portfolio-session-counted', 'true');
          }
        } else {
          const seedCount = 1;
          setVisitorCount(seedCount);
          localStorage.setItem('visitor-count-local', String(seedCount));
          sessionStorage.setItem('portfolio-session-counted', 'true');
        }
      });
  }, []);

  // Sync state on load
  useEffect(() => {
    const savedType = localStorage.getItem('visitor-type') as VisitorType;
    if (savedType) setVisitorType(savedType);

    const savedEli5 = localStorage.getItem('eli5-mode');
    if (savedEli5) setEli5Mode(savedEli5 === 'true');

    const savedBadges = localStorage.getItem('portfolio-badges');
    if (savedBadges) {
      try {
        setUnlockedBadges(JSON.parse(savedBadges));
      } catch (e) {
        console.error('Failed to parse saved badges', e);
      }
    }

    const savedSections = localStorage.getItem('portfolio-visited-sections');
    if (savedSections) {
      try {
        setVisitedSections(JSON.parse(savedSections));
      } catch (e) {
        console.error('Failed to parse saved sections', e);
      }
    }
  }, []);

  const updateVisitorType = (type: VisitorType) => {
    setVisitorType(type);
    localStorage.setItem('visitor-type', type);
  };

  const updateEli5Mode = (mode: boolean) => {
    setEli5Mode(mode);
    localStorage.setItem('eli5-mode', String(mode));
  };

  const unlockBadge = (id: string) => {
    if (unlockedBadges.includes(id)) return;
    
    const nextBadges = [...unlockedBadges, id];
    setUnlockedBadges(nextBadges);
    localStorage.setItem('portfolio-badges', JSON.stringify(nextBadges));

    // Play synthesized success sound
    sound.playSuccess();

    // Trigger toast notification
    const matchedBadge = BADGES.find((b) => b.id === id);
    if (matchedBadge) {
      setActiveToast(matchedBadge);
    }
  };

  const markSectionVisited = (sectionId: string) => {
    if (visitedSections.includes(sectionId)) return;

    const nextSections = [...visitedSections, sectionId];
    setVisitedSections(nextSections);
    localStorage.setItem('portfolio-visited-sections', JSON.stringify(nextSections));

    // Check if user has visited all 6 main sections:
    // Hero, About, Skills, Hackathons, Projects, Certificates, Contact, Guestbook
    // We'll require 6 sections to qualify for Explorer: about, skills, hackathons, projects, certificates, contact
    const mainSections = ['about', 'skills', 'hackathons', 'projects', 'certificates', 'contact'];
    const hasVisitedAllMain = mainSections.every((sec) => nextSections.includes(sec));
    
    if (hasVisitedAllMain) {
      unlockBadge('explorer');
    }
  };

  const resetAchievements = () => {
    sound.playClick();
    setUnlockedBadges([]);
    setVisitedSections([]);
    localStorage.removeItem('portfolio-badges');
    localStorage.removeItem('portfolio-visited-sections');
  };

  return (
    <PortfolioContext.Provider
      value={{
        visitorType,
        setVisitorType: updateVisitorType,
        eli5Mode,
        setEli5Mode: updateEli5Mode,
        unlockedBadges,
        unlockBadge,
        visitedSections,
        markSectionVisited,
        resetAchievements,
        activeToast,
        setActiveToast,
        visitorCount,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
