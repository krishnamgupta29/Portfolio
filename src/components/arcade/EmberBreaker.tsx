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

interface EmberBreakerProps {
  gameState: 'idle' | 'playing' | 'gameover' | 'victory';
  setGameState: (state: 'idle' | 'playing' | 'gameover' | 'victory') => void;
  onStatusChange: (status: { score: number; lives?: number }) => void;
  useAI: boolean;
}

const EmberBreaker: React.FC<EmberBreakerProps> = ({
  gameState,
  setGameState,
  onStatusChange,
  useAI,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Refs for tracking score/lives internally to sync with parent
  const scoreRef = useRef<number>(0);
  const livesRef = useRef<number>(3);

  // Physics variables (stored in refs to avoid React re-render lag in loop)
  const ballX = useRef<number>(240);
  const ballY = useRef<number>(220);
  const ballSpeedX = useRef<number>(3);
  const ballSpeedY = useRef<number>(-3);
  const ballRadius = 6;

  const paddleWidth = 80;
  const paddleHeight = 10;
  const paddleX = useRef<number>(200); // left position
  const isMovingLeft = useRef<boolean>(false);
  const isMovingRight = useRef<boolean>(false);

  // Bricks setup
  const brickRows = 4;
  const brickCols = 6;
  const brickWidth = 64;
  const brickHeight = 16;
  const brickPadding = 6;
  const brickOffsetTop = 30;
  const brickOffsetLeft = 34;
  const bricks = useRef<{ status: number; color: string }[][]>([]);

  // Particles for shatter juice
  const particles = useRef<Particle[]>([]);

  // Init brick grid
  const initBricks = () => {
    const colors = ['#ff7b00', '#ffa200', '#ffd000', '#ffea00'];
    bricks.current = [];
    for (let r = 0; r < brickRows; r++) {
      bricks.current[r] = [];
      for (let c = 0; c < brickCols; c++) {
        bricks.current[r][c] = { status: 1, color: colors[r % colors.length] };
      }
    }
  };

  const resetEntities = () => {
    ballX.current = 240;
    ballY.current = 220;
    ballSpeedX.current = Math.random() > 0.5 ? 2.5 : -2.5;
    ballSpeedY.current = -3;
    paddleX.current = 200;
  };

  // Synchronize initial game start
  useEffect(() => {
    if (gameState === 'playing') {
      initBricks();
      resetEntities();
      scoreRef.current = 0;
      livesRef.current = 3;
      onStatusChange({ score: 0, lives: 3 });
    }
  }, [gameState]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        if (e.key === 'ArrowLeft') e.preventDefault();
        isMovingLeft.current = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        if (e.key === 'ArrowRight') e.preventDefault();
        isMovingRight.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        isMovingLeft.current = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        isMovingRight.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const spawnParticles = (x: number, y: number, color: string) => {
      for (let i = 0; i < 8; i++) {
        particles.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          radius: Math.random() * 2 + 1,
          color,
          alpha: 1,
          life: 30 + Math.random() * 20,
        });
      }
    };

    const draw = () => {
      // Clear with slight trail
      ctx.fillStyle = 'rgba(10, 10, 10, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (gameState !== 'playing') {
        // Just draw static assets in background
        ctx.fillStyle = '#ff7b00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff7b00';
        ctx.beginPath();
        ctx.roundRect(paddleX.current, canvas.height - 18, paddleWidth, paddleHeight, 5);
        ctx.fill();
        ctx.shadowBlur = 0;
        return;
      }

      // Paddle movement
      if (useAI) {
        const paddleCenter = paddleX.current + paddleWidth / 2;
        const diff = ballX.current - paddleCenter;
        const speed = 4.5;
        if (Math.abs(diff) > 4) {
          paddleX.current += Math.sign(diff) * speed;
        }
      } else {
        const speed = 5.5;
        if (isMovingLeft.current) {
          paddleX.current -= speed;
        }
        if (isMovingRight.current) {
          paddleX.current += speed;
        }
      }

      if (paddleX.current < 0) paddleX.current = 0;
      if (paddleX.current > canvas.width - paddleWidth) {
        paddleX.current = canvas.width - paddleWidth;
      }

      // Ball movement
      ballX.current += ballSpeedX.current;
      ballY.current += ballSpeedY.current;

      if (ballX.current + ballRadius > canvas.width || ballX.current - ballRadius < 0) {
        ballSpeedX.current = -ballSpeedX.current;
        sound.playGameTone(450, 0.05, 'sine');
      }
      if (ballY.current - ballRadius < 0) {
        ballSpeedY.current = -ballSpeedY.current;
        sound.playGameTone(450, 0.05, 'sine');
      }

      // Paddle collision
      const isOverPaddleX = ballX.current > paddleX.current && ballX.current < paddleX.current + paddleWidth;
      const isHittingPaddleY = ballY.current + ballRadius >= canvas.height - 18 && ballY.current - ballRadius <= canvas.height - 18 + paddleHeight;

      if (isOverPaddleX && isHittingPaddleY && ballSpeedY.current > 0) {
        const hitPoint = ballX.current - (paddleX.current + paddleWidth / 2);
        const normalizedHit = hitPoint / (paddleWidth / 2);
        ballSpeedY.current = -ballSpeedY.current;
        ballSpeedX.current = normalizedHit * 4;
        sound.playGameTone(550, 0.08, 'triangle');
      }

      // Fall out of bounds
      if (ballY.current + ballRadius > canvas.height) {
        sound.playGameTone(150, 0.35, 'triangle');
        livesRef.current -= 1;
        onStatusChange({ score: scoreRef.current, lives: livesRef.current });
        if (livesRef.current <= 0) {
          setGameState('gameover');
        } else {
          resetEntities();
        }
      }

      // Bricks draw & collision
      let bricksLeft = 0;
      for (let r = 0; r < brickRows; r++) {
        for (let c = 0; c < brickCols; c++) {
          const b = bricks.current[r][c];
          if (b && b.status === 1) {
            bricksLeft++;
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;

            const hitX = ballX.current + ballRadius > brickX && ballX.current - ballRadius < brickX + brickWidth;
            const hitY = ballY.current + ballRadius > brickY && ballY.current - ballRadius < brickY + brickHeight;

            if (hitX && hitY) {
              b.status = 0;
              ballSpeedY.current = -ballSpeedY.current;
              scoreRef.current += 10;
              onStatusChange({ score: scoreRef.current, lives: livesRef.current });
              spawnParticles(brickX + brickWidth / 2, brickY + brickHeight / 2, b.color);
              sound.playGameTone(600 + Math.random() * 200, 0.08, 'sine');
            }

            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.roundRect(brickX, brickY, brickWidth, brickHeight, 3);
            ctx.fill();
          }
        }
      }

      if (bricksLeft === 0 && gameState === 'playing') {
        sound.playSuccess();
        setGameState('victory');
      }

      // Draw Ball
      ctx.fillStyle = '#ffd000';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ffd000';
      ctx.beginPath();
      ctx.arc(ballX.current, ballY.current, ballRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Paddle
      ctx.fillStyle = '#ff7b00';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff7b00';
      ctx.beginPath();
      ctx.roundRect(paddleX.current, canvas.height - 18, paddleWidth, paddleHeight, 5);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Particles
      particles.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.035;
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

    const handleMouseMove = (e: MouseEvent) => {
      if (gameState !== 'playing' || useAI) return;
      const rect = canvas.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      paddleX.current = relativeX - paddleWidth / 2;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (gameState !== 'playing' || useAI) return;
      const rect = canvas.getBoundingClientRect();
      const relativeX = e.touches[0].clientX - rect.left;
      paddleX.current = relativeX - paddleWidth / 2;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove);

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gameState, useAI]);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={320}
      className="w-full h-full block cursor-none"
    />
  );
};

export default EmberBreaker;
