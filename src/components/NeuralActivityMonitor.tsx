import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap } from 'lucide-react';

const NeuralActivityMonitor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [spikeCount, setSpikeCount] = useState(18);
  const [currentFreq, setCurrentFreq] = useState('12.8 Hz');

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Hero Mouse Parallax Tilt
  useEffect(() => {
    if (reducedMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      const hero = document.getElementById('hero');
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      if (e.clientY < rect.top - 200 || e.clientY > rect.bottom + 200) return;

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rotY = ((e.clientX - cx) / (rect.width / 2)) * 7;
      const rotX = ((e.clientY - cy) / (rect.height / 2)) * -7;
      setTilt({ x: rotX, y: rotY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [reducedMotion]);

  // Periodic Neural Spike & Frequency Randomizer
  useEffect(() => {
    const timer = setInterval(() => {
      setSpikeCount((prev) => prev + 1);
      const freqs = ['12.4 Hz', '14.2 Hz', '11.9 Hz', '13.6 Hz', '15.1 Hz'];
      setCurrentFreq(freqs[Math.floor(Math.random() * freqs.length)]);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Main Canvas Oscilloscope Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;
    let hoverAmount = 1.0;

    const render = () => {
      const width = (canvas.width = canvas.parentElement?.clientWidth || 420);
      const height = (canvas.height = 200);

      time += 1;

      // Smooth lerp hover state amplitude boost
      const targetHover = isHovered ? 1.6 : 1.0;
      hoverAmount += (targetHover - hoverAmount) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Faint scrolling grid background
      ctx.strokeStyle = 'rgba(255, 136, 0, 0.06)';
      ctx.lineWidth = 1;
      const gridSize = 20;
      const gridShift = (time * 0.4) % gridSize;
      for (let x = -gridShift; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Signal Channels Configuration
      const channels = [
        {
          color: '#ff7b00',
          glow: 'rgba(255, 123, 0, 0.85)',
          baseAmp: 22,
          freq: 0.024,
          speed: 0.05,
          offsetY: height * 0.38,
          strokeWidth: 2.5,
        },
        {
          color: '#ffaa00',
          glow: 'rgba(255, 170, 0, 0.70)',
          baseAmp: 16,
          freq: 0.034,
          speed: 0.07,
          offsetY: height * 0.52,
          strokeWidth: 2.0,
        },
        {
          color: '#ffd700',
          glow: 'rgba(255, 215, 0, 0.60)',
          baseAmp: 11,
          freq: 0.048,
          speed: 0.09,
          offsetY: height * 0.66,
          strokeWidth: 1.5,
        },
      ];

      // Traveling Spike position
      const spikeX = (time * 2.4) % (width + 300) - 150;

      channels.forEach((ch, idx) => {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = ch.strokeWidth;
        ctx.shadowColor = ch.glow;
        ctx.shadowBlur = 12 * hoverAmount;

        for (let x = 0; x <= width; x += 2) {
          const amp = ch.baseAmp * hoverAmount;
          let y = Math.sin(x * ch.freq - time * ch.speed + idx * 1.8) * amp;
          y += Math.sin(x * ch.freq * 2.2 - time * ch.speed * 1.3) * (amp * 0.35);

          // Neural Spike envelope
          const distToSpike = Math.abs(x - spikeX);
          if (distToSpike < 55) {
            const env = Math.cos((distToSpike / 55) * (Math.PI / 2));
            const spikePulse = Math.sin(distToSpike * 0.24) * 42 * env;
            y += spikePulse;
          }

          const finalY = ch.offsetY + y;
          if (x === 0) {
            ctx.moveTo(x, finalY);
          } else {
            ctx.lineTo(x, finalY);
          }
        }

        ctx.stroke();

        // Leading edge glow indicator dot
        const leadingX = (time * (ch.speed * 180) + idx * 70) % width;
        const leadingAmp = ch.baseAmp * hoverAmount;
        const leadingY = ch.offsetY + Math.sin(leadingX * ch.freq - time * ch.speed) * leadingAmp;
        ctx.beginPath();
        ctx.arc(leadingX, leadingY, ch.strokeWidth * 1.4, 0, Math.PI * 2);
        ctx.fillStyle = ch.color;
        ctx.shadowColor = ch.glow;
        ctx.shadowBlur = 16 * hoverAmount;
        ctx.fill();

        ctx.restore();
      });

      if (!reducedMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isHovered, reducedMotion]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 25 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      style={{
        transform: reducedMotion
          ? 'none'
          : `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.15s ease-out',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full max-w-[460px] rounded-3xl border border-white/10 dark:border-white/10 light:border-black/10 bg-black/50 dark:bg-black/50 light:bg-white/80 backdrop-blur-xl p-5 shadow-[0_0_35px_rgba(255,123,0,0.12)] group overflow-hidden"
    >
      {/* Background radial glow inside monitor frame */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 opacity-20 group-hover:opacity-45"
        style={{
          background: 'radial-gradient(circle, #ff7b00 0%, transparent 70%)',
        }}
      />

      {/* Monitor Header / Chrome */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 dark:border-white/10 light:border-black/10">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-display font-bold tracking-widest text-white/80 dark:text-white/80 light:text-black/80 uppercase flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-harvest-orange" />
            Neural Activity
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-harvest-orange bg-harvest-orange/10 border border-harvest-orange/20 rounded-md px-2 py-0.5 font-semibold">
            LIVE
          </span>
          <span className="text-[10px] font-mono text-white/40 dark:text-white/40 light:text-black/40">
            EEG-01
          </span>
        </div>
      </div>

      {/* Waveform Oscilloscope Screen */}
      <div className="relative w-full h-[180px] sm:h-[200px] rounded-xl overflow-hidden bg-black/50 dark:bg-black/50 light:bg-black/5 border border-white/5">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Bottom Telemetry Metrics Bar */}
      <div className="grid grid-cols-3 gap-2 pt-3 mt-2 border-t border-white/10 dark:border-white/10 light:border-black/10 text-left">
        <div>
          <span className="text-[9px] font-display uppercase tracking-wider text-white/40 block">Frequency</span>
          <span className="text-xs font-mono font-bold text-harvest-orange">{currentFreq}</span>
        </div>
        <div>
          <span className="text-[9px] font-display uppercase tracking-wider text-white/40 block">Spikes</span>
          <span className="text-xs font-mono font-bold text-gold">{spikeCount} / min</span>
        </div>
        <div>
          <span className="text-[9px] font-display uppercase tracking-wider text-white/40 block">Status</span>
          <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
            <Zap className="w-3 h-3 fill-emerald-400" /> Optimal
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default NeuralActivityMonitor;
