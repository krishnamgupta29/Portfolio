import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Trophy, Award, Eye, X, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import sound from '../utils/sound';

gsap.registerPlugin(ScrollTrigger);

interface HackathonEvent {
  id: string;
  title: string;
  team: string;
  result: string;
  location?: string;
  isWinner?: boolean;
  isSpecial?: boolean;
  certPath?: string;
}

const events: HackathonEvent[] = [
  { id: 'iit-ropar', title: 'IIT Ropar Hackathon', team: 'Xynapse', result: '🥇 1st Prize in AI in Healthcare', location: 'IIT Ropar', isWinner: true, isSpecial: true, certPath: '/certificates/hackathon/iit ropar.pdf' },
  { id: 'india-innovation', title: 'India Innovation', team: 'Xynapse', result: '🚀 Selected in Open Innovation', location: 'Bharat Mandapam', isWinner: true, certPath: '/certificates/hackathon/india innovation.pdf' },
  { id: 'codepunk', title: 'CodePunk v2.0', team: 'Xynapse', result: '🔥 Top 7 Finalist', location: 'GLA University', certPath: '/certificates/hackathon/CodePunk_v2.0_Krishnam_Gupta.pdf' },
  { id: 'hackindia-spark2', title: 'HackIndia Spark 2', team: 'Xynapse', result: '✨ Top 10 Finalist', location: 'EIT Faridabad', certPath: '/certificates/hackathon/3.pdf' },
  { id: 'hackentrix', title: 'Hackentrix Hackathon', team: 'Xynapse', result: '✨ Top 10 Finalist', certPath: '/certificates/hackathon/41.pdf' },
  { id: 'hackentrix-2026', title: 'Hackentrix 2026', team: 'Xynapse', result: '✨ Top 10 Finalist', location: 'Google Developer Groups', certPath: '/certificates/hackathon/40.jpg' },
  { id: 'et-genai', title: 'ET Gen AI Hackathon', team: 'Xynapse', result: '✨ Round 1 Qualified', location: 'Economic Times', certPath: '/certificates/hackathon/ET-AI_Hackathon_2026_Certificate_Krishnam_Gupta.pdf' },
  { id: 'iit-hyd', title: 'IIT Hyderabad AI/ML Hackathon', team: 'Xynapse', result: 'Participant', location: 'IIT Hyderabad', certPath: '/certificates/hackathon/IIT HYDRABAD.pdf' },
  { id: 'graphic-era', title: 'Graphic Era Hackathon', team: 'Xynapse', result: 'Participant', location: 'Graphic Era University', certPath: '/certificates/hackathon/graphic era.pdf' },
  { id: 'hackindia-spark4', title: 'HackIndia Spark 4', team: 'Xynapse', result: 'Participant', location: 'KCC IMT', certPath: '/certificates/hackathon/spark 4.pdf' },
  { id: 'dark-rise', title: 'Dark Rise', team: 'Xynapse', result: 'Online Pitching Round Participant', certPath: '/certificates/hackathon/DARK RISE.pdf' },
  { id: 'rift', title: 'RIFT \'26 Hackathon', team: 'Xynapse', result: 'Participant', location: 'Physics Wallah Institute', certPath: '/certificates/hackathon/RIFTE.pdf' }
];

const HackathonsGallery: React.FC = () => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(true);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeCert, setActiveCert] = useState<{ path: string; title: string } | null>(null);

  useEffect(() => {
    const handleCheck = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleCheck();
    window.addEventListener('resize', handleCheck);
    return () => window.removeEventListener('resize', handleCheck);
  }, []);

  // GSAP Horizontal Scroll Pinning on Desktop
  useEffect(() => {
    if (isMobile) return;

    const trigger = triggerRef.current;
    const gallery = galleryRef.current;
    if (!trigger || !gallery) return;

    const scrollWidth = gallery.scrollWidth - window.innerWidth;
    
    // Play transition whoosh sound when horizontal starts
    sound.playWhoosh();

    const anim = gsap.to(gallery, {
      x: -scrollWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: trigger,
        pin: true,
        scrub: 0.8,
        start: 'top top',
        end: () => `+=${gallery.scrollWidth * 0.8}`,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      },
    });

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, [isMobile]);

  const handleOpenCert = (path: string, title: string) => {
    sound.playClick();
    setActiveCert({ path, title });
  };

  const handleCloseCert = () => {
    sound.playClick();
    setActiveCert(null);
  };

  return (
    <div
      ref={triggerRef}
      id="hackathons-section"
      className="relative w-full bg-[#070707] dark:bg-[#070707] light:bg-transparent overflow-hidden"
    >
      {isMobile ? (
        /* Mobile Layout: Normal vertical layout list */
        <div className="py-24 px-6 sm:px-12 md:px-20 text-left">
          {/* Header */}
          <div className="mb-12">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white dark:text-white light:text-black tracking-tight flex items-center gap-3">
              Hackathons & Wins
            </h2>
            <p className="mt-2 text-sm text-white/50 dark:text-white/50 light:text-black/50 font-sans max-w-xl">
              Showcasing competition participation and victories, pushing boundaries in intense build sprints.
            </p>
            <div className="w-16 h-1 bg-linear-to-r from-harvest-orange to-gold mt-4 rounded-full"></div>
          </div>

          <div className="flex flex-col gap-6">
            {events.map((event) => (
              <MobileHackathonCard key={event.id} event={event} onViewCert={handleOpenCert} />
            ))}
          </div>
        </div>
      ) : (
        /* Desktop Layout: Fixed horizontal scroll gallery with flow-aligned header to prevent overlap */
        <div className="h-screen w-full flex flex-col justify-between overflow-hidden bg-black/10 py-16">
          {/* Section Header */}
          <div className="px-20 text-left">
            <h2 className="font-display font-black text-4xl text-white dark:text-white light:text-black tracking-tight flex items-center gap-3">
              Hackathons & Wins
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-white/50 dark:text-white/50 light:text-black/50 font-sans max-w-2xl">
              Showcasing competition victories, pushing the boundaries of AI, ML, and software engineering in intense sprints. (Scroll to explore)
            </p>
            <div className="w-16 h-1 bg-linear-to-r from-harvest-orange to-gold mt-3 rounded-full"></div>
          </div>

          {/* Horizontal Gallery Rail */}
          <div ref={galleryRef} className="flex flex-row flex-nowrap items-center gap-8 px-20 w-max my-auto">
            {events.map((event) => (
              <DesktopHackathonCard key={event.id} event={event} onViewCert={handleOpenCert} />
            ))}
          </div>

          {/* Horizontal Progress Bar */}
          <div className="px-20">
            <div className="h-1 bg-white/5 dark:bg-white/5 light:bg-black/10 rounded-full overflow-hidden w-full">
              <div
                className="h-full bg-linear-to-r from-harvest-orange to-gold transition-all duration-100"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Certificate Lightbox */}
      <AnimatePresence>
        {activeCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-4xl h-[85vh] bg-[#121212] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
                <div className="text-left">
                  <span className="text-[10px] font-display font-semibold uppercase tracking-widest text-harvest-orange">
                    Achievement Credentials
                  </span>
                  <h3 className="font-display font-black text-base sm:text-lg text-white">
                    {activeCert.title}
                  </h3>
                </div>
                <button
                  onClick={handleCloseCert}
                  className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* PDF viewport */}
              <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden p-2 sm:p-4">
                <iframe
                  src={`${activeCert.path}#toolbar=0`}
                  className="w-full h-full border-0 rounded-xl bg-white"
                  title={activeCert.title}
                />
              </div>

              {/* Action footer */}
              <div className="p-5 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row gap-4 items-center justify-end">
                <a
                  href={activeCert.path}
                  download
                  onClick={() => sound.playClick()}
                  className="flex-1 sm:flex-none px-6 py-3 bg-linear-to-r from-harvest-orange to-gold text-black rounded-xl text-xs font-display font-bold uppercase tracking-widest text-center shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Certificate
                </a>
                <button
                  onClick={handleCloseCert}
                  className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-display font-bold uppercase tracking-widest transition-all cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 1st Prize Confetti Card Trigger
const ConfettiWinnerCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.6 });

  useEffect(() => {
    if (isInView) {
      sound.playWhoosh();
      // Double confetti bursts for 1st place!
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6, x: 0.4 },
          colors: ['#ff7b00', '#ffd000', '#ffffff'],
        });
      }, 200);
      
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.5, x: 0.6 },
          colors: ['#ff8800', '#ffea00', '#ffffff'],
        });
      }, 550);
    }
  }, [isInView]);

  return <div ref={cardRef} className="h-full">{children}</div>;
};

const DesktopHackathonCard: React.FC<{ event: HackathonEvent; onViewCert: (path: string, title: string) => void }> = ({ event, onViewCert }) => {
  const content = (
    <div className={`w-96 p-8 rounded-3xl backdrop-blur-md flex flex-col justify-between h-[360px] transition-all duration-300 relative overflow-hidden group border ${event.isSpecial ? 'bg-linear-to-b from-harvest-orange/15 to-transparent border-harvest-orange/60 shadow-[0_0_25px_rgba(255,123,0,0.18)]' : 'bg-[#141414]/75 hover:bg-[#1c1c1c]/75 border-white/5 hover:border-harvest-orange/30 shadow-lg'}`}>
      {event.isSpecial && <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-2000 ease-out pointer-events-none" />}
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-harvest-orange flex items-center justify-center">
            {event.isWinner ? <Trophy className="w-6 h-6 animate-pulse" /> : <Award className="w-6 h-6" />}
          </div>
          <span className="text-[10px] font-display font-semibold uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/50">Team {event.team}</span>
        </div>
        <h3 className="font-display font-black text-2xl text-white mb-3 tracking-tight">{event.title}</h3>
        {event.location && <span className="text-[11px] font-sans text-white/40 block mb-4">📍 {event.location}</span>}
      </div>
      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
        <div>
          <span className="text-[9px] font-display font-semibold uppercase tracking-widest text-white/30 block mb-1">Achievement</span>
          <span className={`text-sm font-sans font-bold ${event.isWinner ? 'text-gold' : 'text-white/80'}`}>{event.result}</span>
        </div>
        {event.certPath && (
          <button onClick={(e) => { e.stopPropagation(); onViewCert(event.certPath!, event.title); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-harvest-orange/20 border border-white/10 hover:border-harvest-orange/30 text-xs text-white hover:text-harvest-orange transition-all cursor-pointer">
            <Eye className="w-3.5 h-3.5" /> Cert
          </button>
        )}
      </div>
    </div>
  );
  return event.isSpecial ? <ConfettiWinnerCard>{content}</ConfettiWinnerCard> : content;
};

const MobileHackathonCard: React.FC<{ event: HackathonEvent; onViewCert: (path: string, title: string) => void }> = ({ event, onViewCert }) => {
  const content = (
    <div onClick={() => sound.playClick()} className={`p-6 rounded-2xl border text-left flex flex-col justify-between min-h-[220px] transition-all duration-300 ${event.isSpecial ? 'bg-linear-to-b from-harvest-orange/10 to-transparent border-harvest-orange shadow-[0_0_20px_rgba(255,123,0,0.12)]' : 'bg-white/3 border-white/5'}`}>
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-harvest-orange">{event.isWinner ? <Trophy className="w-5 h-5" /> : <Award className="w-5 h-5" />}</div>
          <span className="text-[9px] font-display font-semibold uppercase tracking-widest text-white/50">Team {event.team}</span>
        </div>
        <h3 className="font-display font-bold text-lg text-white">{event.title}</h3>
        {event.location && <span className="text-[10px] text-white/40 block mt-1">📍 {event.location}</span>}
      </div>
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
        <div>
          <span className="text-[8px] font-display font-semibold uppercase tracking-widest text-white/30 block mb-0.5">Achievement</span>
          <span className={`text-xs font-bold ${event.isWinner ? 'text-gold' : 'text-white/70'}`}>{event.result}</span>
        </div>
        {event.certPath && (
          <button onClick={(e) => { e.stopPropagation(); onViewCert(event.certPath!, event.title); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-harvest-orange/20 border border-white/10 hover:border-harvest-orange/30 text-[10px] text-white hover:text-harvest-orange transition-all cursor-pointer">
            <Eye className="w-3 h-3" /> Cert
          </button>
        )}
      </div>
    </div>
  );
  return event.isSpecial ? <ConfettiWinnerCard>{content}</ConfettiWinnerCard> : content;
};

export default HackathonsGallery;
