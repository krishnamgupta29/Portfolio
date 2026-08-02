import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import sound from '../utils/sound';
import { User, MessageSquare, CircleAlert, Send, Pin } from 'lucide-react';

interface GuestbookMessage {
  id: string;
  name: string;
  text: string;
  timestamp: string;
  tilt: number;
  createdAt: number;
}

interface Reactions {
  [msgId: string]: { heart: number; fire: number; clap: number };
}

// Warm tint palette within orange-gold spectrum
const TINTS = [
  'rgba(255, 136, 0, 0.10)',
  'rgba(255, 162, 0, 0.09)',
  'rgba(255, 110, 20, 0.10)',
  'rgba(255, 190, 50, 0.08)',
  'rgba(220, 100, 0, 0.09)',
];

function getCardTint(id: string): string {
  const idx = id.charCodeAt(0) % TINTS.length;
  return TINTS[idx];
}

// Drifting background particles for the corkboard wall
function CorkboardParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="drifting-particle"
          style={{
            left: `${10 + i * 11}%`,
            top: `${15 + (i % 3) * 30}%`,
            animationDelay: `${i * 0.8}s`,
            width: `${4 + (i % 3) * 2}px`,
            height: `${4 + (i % 3) * 2}px`,
            opacity: 0.18,
          }}
        />
      ))}
    </div>
  );
}

// 3D tilt sticky-note card
function StickyCard({
  msg,
  reactions,
  onReact,
  isNew,
}: {
  msg: GuestbookMessage;
  reactions: { heart: number; fire: number; clap: number };
  onReact: (id: string, reaction: 'heart' | 'fire' | 'clap') => void;
  isNew: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -6;
    const rotateY = ((x - cx) / cx) * 6;
    card.style.transform = `rotate(${msg.tilt}deg) perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`;
  }, [msg.tilt]);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = `rotate(${msg.tilt}deg)`;
  }, [msg.tilt]);

  return (
    <motion.div
      key={msg.id}
      initial={{ opacity: 0, scale: 0.3, y: -80 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.7, y: 20 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, mass: 0.9 }}
      className="break-inside-avoid"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative p-5 rounded-2xl border border-white/10 dark:border-white/10 light:border-black/10 text-left flex flex-col justify-between min-h-[140px] shadow-xl transition-shadow duration-200 hover:shadow-harvest-orange/15 group cursor-default"
        style={{
          transform: `rotate(${msg.tilt}deg)`,
          background: `linear-gradient(135deg, ${getCardTint(msg.id)}, rgba(255,255,255,0.02))`,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          transition: 'transform 0.15s ease, box-shadow 0.2s ease',
        }}
      >
        {/* Decorative pin */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 text-harvest-orange drop-shadow-md">
          <Pin className="w-4 h-4 fill-harvest-orange" />
        </div>

        {/* NEW badge */}
        {isNew && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="absolute top-2 right-2 text-[8px] font-display font-black tracking-wider text-harvest-orange bg-harvest-orange/10 border border-harvest-orange/30 rounded-full px-1.5 py-0.5"
          >
            ✨ NEW
          </motion.span>
        )}

        {/* Message text */}
        <p className="text-white/75 dark:text-white/75 light:text-black/70 font-sans text-xs leading-relaxed italic mb-3 mt-2">
          "{msg.text}"
        </p>

        {/* Footer row */}
        <div className="flex justify-between items-end pt-2 border-t border-white/5 dark:border-white/5 light:border-black/5">
          <div>
            <span className="text-[9px] font-display font-bold text-white dark:text-white light:text-black group-hover:text-harvest-orange transition-colors block">
              {msg.name}
            </span>
            <span className="text-[8px] text-white/35 dark:text-white/35 light:text-black/40 font-mono">
              {msg.timestamp}
            </span>
          </div>

          {/* Reaction buttons */}
          <div className="flex items-center gap-1">
            {(['heart', 'fire', 'clap'] as const).map((type) => {
              const emoji = type === 'heart' ? '❤️' : type === 'fire' ? '🔥' : '👏';
              const count = reactions[type] ?? 0;
              return (
                <button
                  key={type}
                  onClick={() => { sound.playClick(); onReact(msg.id, type); }}
                  className="text-[9px] px-1 py-0.5 rounded-md bg-white/5 hover:bg-harvest-orange/15 border border-white/5 hover:border-harvest-orange/30 transition-all duration-150 cursor-pointer flex items-center gap-0.5 font-mono"
                  title={`React with ${emoji}`}
                >
                  {emoji} {count > 0 ? count : ''}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Animated count-up hook
function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(target);
  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }
    let start = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 30)));
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

const Guestbook: React.FC = () => {
  const { unlockBadge, markSectionVisited } = usePortfolio();
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [reactions, setReactions] = useState<Reactions>({});
  const [now, setNow] = useState(Date.now());

  // Count-up for real signed visitor count
  const signedCount = messages.length;
  const visitorCount = useCountUp(signedCount, 800);

  // Keep "now" current for NEW badge logic
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

  // Load messages from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('portfolio-guestbook');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        setMessages([]);
      }
    }

    const savedReactions = localStorage.getItem('portfolio-guestbook-reactions');
    if (savedReactions) {
      try {
        setReactions(JSON.parse(savedReactions));
      } catch {
        setReactions({});
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();

    if (honeypot.trim() !== '') return;

    if (!name.trim() || !message.trim()) {
      setError('Please fill in both name and message fields.');
      return;
    }

    if (message.length > 150) {
      setError('Message exceeds the 150 character limit.');
      return;
    }

    const lastPosted = localStorage.getItem('guestbook-last-posted');
    const ts = Date.now();
    if (lastPosted && ts - parseInt(lastPosted) < 30000) {
      setError('Please wait 30 seconds before writing another signature.');
      return;
    }

    setError('');
    const newEntry: GuestbookMessage = {
      id: ts.toString(),
      name: name.trim(),
      text: message.trim(),
      timestamp: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      tilt: Math.floor(Math.random() * 6) - 3,
      createdAt: ts,
    };

    const updatedMessages = [newEntry, ...messages];
    setMessages(updatedMessages);
    localStorage.setItem('portfolio-guestbook', JSON.stringify(updatedMessages));
    localStorage.setItem('guestbook-last-posted', ts.toString());

    // 🎊 Confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff8800', '#ffb700', '#ff6200', '#ffe066', '#ffffff'],
    });

    unlockBadge('signed');
    setName('');
    setMessage('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleReact = (id: string, type: 'heart' | 'fire' | 'clap') => {
    setReactions((prev) => {
      const existing = prev[id] ?? { heart: 0, fire: 0, clap: 0 };
      const updated = { ...prev, [id]: { ...existing, [type]: existing[type] + 1 } };
      localStorage.setItem('portfolio-guestbook-reactions', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <section
      id="guestbook-section"
      className="relative py-24 px-6 sm:px-12 md:px-20 lg:px-32 xl:px-40 overflow-hidden border-t border-white/5"
      onMouseEnter={() => markSectionVisited('guestbook')}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* ── Left column: form ── */}
        <div className="lg:col-span-5 text-left space-y-6">
          <div>
            <h2 className="reveal-wipe-container font-display font-black text-3xl sm:text-4xl text-white dark:text-white light:text-black tracking-tight flex items-center gap-3">
              Visitor Guestbook
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-white/50 dark:text-white/50 light:text-black/50 font-sans">
              Leave a public signature, feedback, or a quick note on your way through this universe.
            </p>
            <div className="w-16 h-1 bg-linear-to-r from-harvest-orange to-gold mt-4 rounded-full" />
          </div>

          {/* Visitor count-up */}
          <div className="flex items-center gap-2 text-xs font-display text-white/40 dark:text-white/40 light:text-black/40">
            <span className="text-harvest-orange font-bold text-base">{visitorCount}</span>
            <span>
              {signedCount === 0
                ? 'visitors have signed this wall — be the first!'
                : signedCount === 1
                ? 'visitor has signed this wall'
                : 'visitors have signed this wall'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                placeholder="Leave this empty"
              />
            </div>

            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 dark:text-white/40 light:text-black/40" />
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 dark:bg-white/5 light:bg-black/3 border border-white/10 dark:border-white/10 light:border-black/10 focus:border-harvest-orange/60 focus:ring-1 focus:ring-harvest-orange/30 text-xs sm:text-sm text-white dark:text-white light:text-black outline-hidden transition-all"
                maxLength={30}
              />
            </div>

            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-white/40 dark:text-white/40 light:text-black/40" />
              <textarea
                placeholder="Leave a short message (max 150 chars)..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full pl-11 pr-4 py-4 rounded-xl bg-white/5 dark:bg-white/5 light:bg-black/3 border border-white/10 dark:border-white/10 light:border-black/10 focus:border-harvest-orange/60 focus:ring-1 focus:ring-harvest-orange/30 text-xs sm:text-sm text-white dark:text-white light:text-black outline-hidden transition-all resize-none"
                maxLength={150}
              />
              <span className="absolute bottom-3 right-3 text-[10px] text-white/30 font-mono">
                {150 - message.length}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 text-xs font-sans flex items-center gap-2"
                >
                  <CircleAlert className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-3.5 rounded-xl bg-green-950/30 border border-green-500/20 text-green-400 text-xs font-sans"
                >
                  ✨ Message published successfully to the message wall!
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full py-3 bg-linear-to-r from-harvest-orange to-gold hover:shadow-lg hover:shadow-harvest-orange/25 text-black font-display font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              <Send className="w-3.5 h-3.5" />
              Sign Guestbook
            </button>
          </form>
        </div>

        {/* ── Right column: corkboard message wall ── */}
        <div className="lg:col-span-7 relative">
          {/* Wall header */}
          <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
            <div>
              <span className="text-xs font-display font-bold text-white/60 reveal-wipe-container block">
                Message Wall
              </span>
              <span className="text-[10px] text-white/30 font-mono">
                {messages.length} {messages.length === 1 ? 'note' : 'notes'} pinned
              </span>
            </div>
          </div>

          {/* Corkboard panel */}
          <div
            className="corkboard-grid relative h-[480px] overflow-y-auto rounded-3xl border border-white/5 p-6 custom-scrollbar"
            style={{ background: 'rgba(20, 10, 0, 0.55)' }}
          >
            <CorkboardParticles />

            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-white/30">
                <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs uppercase font-display font-semibold tracking-wider">
                  Be the first to sign the Guestbook!
                </p>
              </div>
            ) : (
              /* masonry-style 2-col layout */
              <div className="columns-1 sm:columns-2 gap-5 space-y-0">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => {
                    const msgReactions = reactions[msg.id] ?? { heart: 0, fire: 0, clap: 0 };
                    const isNew = (now - (msg.createdAt ?? 0)) < 60000;
                    return (
                      <div key={msg.id} className="mb-5 break-inside-avoid">
                        <StickyCard
                          msg={msg}
                          reactions={msgReactions}
                          onReact={handleReact}
                          isNew={isNew}
                        />
                      </div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Guestbook;
