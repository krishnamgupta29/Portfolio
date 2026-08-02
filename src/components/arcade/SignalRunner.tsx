import React, { useRef, useEffect } from 'react';
import sound from '../../utils/sound';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: 'static' | 'packet'; // static = obstacle (red), packet = collectible (gold)
  color: string;
  id: number;
}

interface SignalRunnerProps {
  gameState: 'idle' | 'playing' | 'gameover' | 'victory';
  setGameState: (state: 'idle' | 'playing' | 'gameover' | 'victory') => void;
  onStatusChange: (status: { score: number; lives?: number }) => void;
  useAI: boolean;
  onCelebration?: (text: string) => void;
}

const SignalRunner: React.FC<SignalRunnerProps> = ({
  gameState,
  setGameState,
  onStatusChange,
  useAI,
  onCelebration,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scoreRef = useRef<number>(0);
  const livesRef = useRef<number>(3);

  // Player position
  const currentLane = useRef<number>(1); // 0, 1, 2
  const laneX = [90, 240, 390];
  const playerX = useRef<number>(240);
  const playerY = 260;
  const playerRadius = 9;

  // Obstacles & Items array
  const entities = useRef<Obstacle[]>([]);
  const nextId = useRef<number>(0);

  // Spawn timer
  const lastSpawnTime = useRef<number>(0);
  const spawnInterval = useRef<number>(1200); // ms

  // Game speed
  const baseSpeed = useRef<number>(3.5);
  const speedMultiplier = useRef<number>(1.0);
  const timeElapsed = useRef<number>(0);

  // Particles
  const particles = useRef<Particle[]>([]);

  // Streak tracking for mid-game wow celebrate
  const comboStreak = useRef<number>(0);

  // Setup/Reset entities
  const initGame = () => {
    scoreRef.current = 0;
    livesRef.current = 3;
    currentLane.current = 1;
    playerX.current = laneX[1];
    entities.current = [];
    particles.current = [];
    baseSpeed.current = 3.5;
    speedMultiplier.current = 1.0;
    timeElapsed.current = 0;
    comboStreak.current = 0;
    onStatusChange({ score: 0, lives: 3 });
  };

  useEffect(() => {
    if (gameState === 'playing') {
      initGame();
    }
  }, [gameState]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        if (e.key === 'ArrowLeft') e.preventDefault();
        currentLane.current = Math.max(0, currentLane.current - 1);
        sound.playGameTone(300, 0.05, 'triangle');
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        if (e.key === 'ArrowRight') e.preventDefault();
        currentLane.current = Math.min(2, currentLane.current + 1);
        sound.playGameTone(300, 0.05, 'triangle');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const spawnParticles = (x: number, y: number, color: string, count = 6) => {
      for (let i = 0; i < count; i++) {
        particles.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          radius: Math.random() * 2 + 1,
          color,
          alpha: 1,
          life: 20 + Math.random() * 15,
        });
      }
    };

    const draw = (nowTime: number) => {
      const dt = nowTime - lastTime;
      lastTime = nowTime;

      // Neon grid background style
      ctx.fillStyle = 'rgba(10, 10, 10, 0.35)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid track lanes
      ctx.strokeStyle = 'rgba(255, 123, 0, 0.06)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const x = 15 + i * 150;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw lane guide glow
      ctx.fillStyle = 'rgba(255, 208, 0, 0.015)';
      const targetLaneX = laneX[currentLane.current];
      ctx.fillRect(targetLaneX - 50, 0, 100, canvas.height);

      if (gameState !== 'playing') {
        // Draw static player in idle/gameover
        ctx.fillStyle = '#ffd000';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffd000';
        ctx.beginPath();
        ctx.arc(playerX.current, playerY, playerRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        return;
      }

      // 1. Difficulty ramp
      timeElapsed.current += dt / 1000;
      speedMultiplier.current = 1.0 + Math.min(1.5, timeElapsed.current / 30); // scale up speed up to 2.5x over 75s

      // 2. AI Autopilot Logic
      if (useAI) {
        // Look ahead for the closest entity
        const upcoming = entities.current
          .filter((e) => e.y < playerY && e.y > 20)
          .sort((a, b) => b.y - a.y); // nearest first

        if (upcoming.length > 0) {
          const nearest = upcoming[0];
          // If nearest is static obstacle, avoid it
          if (nearest.type === 'static' && Math.abs(nearest.y - playerY) < 140) {
            const blockedLane = laneX.findIndex((lx) => lx === nearest.x);
            if (blockedLane === currentLane.current) {
              // Switch to an adjacent empty lane
              const safeLanes = [0, 1, 2].filter((l) => l !== blockedLane);
              // Pick closest safe lane
              const bestSafe = safeLanes.sort((a, b) => Math.abs(a - blockedLane) - Math.abs(b - blockedLane))[0];
              currentLane.current = bestSafe;
              sound.playGameTone(350, 0.05, 'triangle');
            }
          }
          // If nearest is gold packet and safe, seek it
          else if (nearest.type === 'packet' && Math.abs(nearest.y - playerY) < 180) {
            const targetLaneIndex = laneX.findIndex((lx) => lx === nearest.x);
            // Verify it is safe to go there (no red obstacle block in that lane near it)
            const obstacleInThatLane = entities.current.some(
              (e) => e.type === 'static' && e.x === nearest.x && Math.abs(e.y - nearest.y) < 100
            );
            if (!obstacleInThatLane) {
              currentLane.current = targetLaneIndex;
            }
          }
        }
      }

      // Smoothly interpolate player X position towards lane target
      const targetX = laneX[currentLane.current];
      const ease = 0.25;
      playerX.current += (targetX - playerX.current) * ease;

      // 3. Spawning Logic
      if (nowTime - lastSpawnTime.current > spawnInterval.current / speedMultiplier.current) {
        lastSpawnTime.current = nowTime;
        
        // Randomly pick a lane and spawn either Obstacle (static red) or Packet (gold)
        const lane = Math.floor(Math.random() * 3);
        const spawnX = laneX[lane];
        const isPacket = Math.random() > 0.65; // 35% chance gold packet

        entities.current.push({
          id: nextId.current++,
          x: spawnX,
          y: -30,
          width: isPacket ? 16 : 24,
          height: isPacket ? 16 : 14,
          speed: baseSpeed.current * speedMultiplier.current,
          type: isPacket ? 'packet' : 'static',
          color: isPacket ? '#ffd000' : '#ff3333',
        });
      }

      // 4. Update & Draw entities
      entities.current.forEach((ent) => {
        ent.y += ent.speed;

        // Collision Check
        const distY = Math.abs(ent.y - playerY);
        const distX = Math.abs(ent.x - playerX.current);
        const collisionThreshold = playerRadius + (ent.width / 2);

        if (distY < 15 && distX < collisionThreshold) {
          // Collision happened! Remove from entity list
          ent.y = 999; // trigger clean up

          if (ent.type === 'static') {
            livesRef.current -= 1;
            comboStreak.current = 0;
            spawnParticles(playerX.current, playerY, '#ff3333', 12);
            sound.playGameTone(120, 0.4, 'triangle');
            
            onStatusChange({ score: scoreRef.current, lives: livesRef.current });
            if (livesRef.current <= 0) {
              setGameState('gameover');
            }
          } else {
            // Collect Gold Packet
            scoreRef.current += 10;
            comboStreak.current += 1;
            spawnParticles(ent.x, playerY, '#ffd000', 8);
            sound.playGameTone(880 + comboStreak.current * 40, 0.08, 'sine');
            
            // Trigger combo popups
            if (comboStreak.current >= 5 && comboStreak.current % 5 === 0 && onCelebration) {
              onCelebration(`🔥 Streak x${comboStreak.current}!`);
            } else if (scoreRef.current % 100 === 0 && onCelebration) {
              onCelebration('⚡ Score Milestone!');
            }
            
            onStatusChange({ score: scoreRef.current, lives: livesRef.current });
          }
        }

        // Draw Entity
        ctx.fillStyle = ent.color;
        ctx.shadowColor = ent.color;
        ctx.shadowBlur = 8;
        
        ctx.beginPath();
        if (ent.type === 'packet') {
          // Gold spinning diamond shape
          const size = ent.width;
          const rotationAngle = (nowTime / 150) % (Math.PI * 2);
          ctx.save();
          ctx.translate(ent.x, ent.y);
          ctx.rotate(rotationAngle);
          ctx.fillRect(-size / 2, -size / 2, size, size);
          ctx.restore();
        } else {
          // Red glowing grid brick obstacle
          ctx.roundRect(ent.x - ent.width / 2, ent.y - ent.height / 2, ent.width, ent.height, 3);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      });

      // Cleanup offscreen entities
      entities.current = entities.current.filter((e) => e.y < canvas.height + 20);

      // Draw Player Orb with trail
      ctx.fillStyle = '#ffd000';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ffd000';
      ctx.beginPath();
      ctx.arc(playerX.current, playerY, playerRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw speed trail lines
      ctx.strokeStyle = 'rgba(255, 208, 0, 0.15)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(playerX.current, playerY + playerRadius);
      ctx.lineTo(playerX.current, playerY + 30);
      ctx.stroke();

      // Particles draw & logic
      particles.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.04;
        p.life--;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
      particles.current = particles.current.filter((p) => p.life > 0 && p.alpha > 0);

      animationFrameId = requestAnimationFrame(draw);
    };

    // Click/Touch navigation directly
    const handleCanvasClick = (e: MouseEvent) => {
      if (gameState !== 'playing' || useAI) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = clickX / rect.width;
      if (pct < 0.35) {
        currentLane.current = 0;
      } else if (pct > 0.65) {
        currentLane.current = 2;
      } else {
        currentLane.current = 1;
      }
      sound.playGameTone(300, 0.05, 'triangle');
    };

    const handleCanvasTouch = (e: TouchEvent) => {
      if (gameState !== 'playing' || useAI) return;
      const rect = canvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      const pct = touchX / rect.width;
      if (pct < 0.35) {
        currentLane.current = 0;
      } else if (pct > 0.65) {
        currentLane.current = 2;
      } else {
        currentLane.current = 1;
      }
      sound.playGameTone(300, 0.05, 'triangle');
    };

    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('touchstart', handleCanvasTouch);

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('click', handleCanvasClick);
      canvas.removeEventListener('touchstart', handleCanvasTouch);
    };
  }, [gameState, useAI]);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={320}
      className="w-full h-full block cursor-pointer"
    />
  );
};

export default SignalRunner;
