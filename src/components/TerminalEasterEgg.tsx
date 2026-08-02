import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import sound from '../utils/sound';

interface HistoryLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'success';
}

const TerminalEasterEgg: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [history, setHistory] = useState<HistoryLine[]>([
    { text: 'KrishnamOS [Version 1.0.0]', type: 'success' },
    { text: 'Type "help" to see available commands, or "exit" to close.', type: 'output' },
  ]);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount/open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Console hint for curious developers
  useEffect(() => {
    console.log(
      '%cWelcome Curious Developer! %cPsst... try pressing the `~` (tilde) key on your keyboard anywhere on this site to unlock a hidden developer terminal. 💻',
      'color: #ff7b00; font-size: 16px; font-weight: bold; font-family: "Space Grotesk", sans-serif;',
      'color: #ffd000; font-size: 14px; font-family: "Space Grotesk", sans-serif;'
    );
  }, []);

  // Global key event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle terminal on ~ key (Backquote)
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        sound.playClick();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        sound.playClick();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto scroll terminal to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const handleCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim().toLowerCase();
    if (!trimmed) return;

    sound.playClick();
    
    // Add input to history
    const newHistory = [...history, { text: `krishnam-gupta@portfolio:~$ ${cmdStr}`, type: 'input' as const }];

    const navigateTo = (id: string) => {
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };

    switch (trimmed) {
      case 'help':
        newHistory.push({
          text: `Available commands:\n  help        - Show this list\n  whoami      - Print short bio info\n  about       - Go to About section\n  skills      - Go to Skills section\n  hackathons  - Go to Hackathons section\n  certificates- Go to Certificates section\n  contact     - Go to Contact section\n  clear       - Clear terminal logs\n  exit        - Close terminal`,
          type: 'output',
        });
        break;
      case 'whoami':
        newHistory.push({
          text: 'Krishnam Gupta — B.Tech CSE (AI/ML) specialisation student at GLA University. Passions: Machine Learning, Advanced Web Dev, and Game Design.',
          type: 'success',
        });
        break;
      case 'about':
        newHistory.push({ text: 'Navigating to About section...', type: 'output' });
        setIsOpen(false);
        navigateTo('about-section');
        break;
      case 'skills':
        newHistory.push({ text: 'Navigating to Technical Skills...', type: 'output' });
        setIsOpen(false);
        navigateTo('skills-section');
        break;
      case 'hackathons':
        newHistory.push({ text: 'Navigating to Hackathons timeline...', type: 'output' });
        setIsOpen(false);
        navigateTo('hackathons-section');
        break;
      case 'certificates':
        newHistory.push({ text: 'Navigating to Certificates Shelf...', type: 'output' });
        setIsOpen(false);
        navigateTo('certificates-section');
        break;
      case 'contact':
        newHistory.push({ text: 'Navigating to Contact form...', type: 'output' });
        setIsOpen(false);
        navigateTo('contact-section');
        break;
      case 'clear':
        setHistory([]);
        setInputValue('');
        return;
      case 'exit':
        setIsOpen(false);
        break;
      default:
        newHistory.push({ text: `command not found: "${cmdStr}". Try typing "help" for a list of commands.`, type: 'error' });
    }

    setHistory(newHistory);
    setInputValue('');
  };

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleContainerClick}
          className="fixed inset-0 w-full h-full bg-black/95 z-[9999] flex flex-col p-6 sm:p-10 font-mono text-left cursor-text"
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 select-none">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 hover:opacity-80" onClick={() => setIsOpen(false)}></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-xs text-white/50 ml-3">krishnam-gupta@portfolio CLI</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-harvest-orange border border-harvest-orange/30 px-3 py-1 rounded-md hover:bg-harvest-orange hover:text-black transition-all cursor-pointer bg-transparent"
            >
              EXIT [Esc]
            </button>
          </div>

          {/* Terminal Console Logs */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-none">
            {history.map((line, idx) => (
              <div
                key={idx}
                className={`text-xs sm:text-sm whitespace-pre-wrap leading-relaxed ${
                  line.type === 'input'
                    ? 'text-white'
                    : line.type === 'error'
                    ? 'text-red-400'
                    : line.type === 'success'
                    ? 'text-gold font-bold'
                    : 'text-harvest-orange/95'
                }`}
              >
                {line.text}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Interactive Input Line */}
          <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-4 text-xs sm:text-sm select-none">
            <span className="text-gold font-bold">krishnam-gupta@portfolio:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCommand(inputValue);
                }
              }}
              className="flex-1 bg-transparent border-0 outline-hidden text-white font-mono placeholder:text-white/10"
              placeholder="type command..."
              autoFocus
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TerminalEasterEgg;
