import React, { useRef, useEffect } from 'react';
import sound from '../../utils/sound';

interface Point {
  x: number;
  y: number;
}

interface NeonSnakeProps {
  gameState: 'idle' | 'playing' | 'gameover' | 'victory';
  setGameState: (state: 'idle' | 'playing' | 'gameover' | 'victory') => void;
  onStatusChange: (status: { score: number; length?: number }) => void;
  useAI: boolean;
  onCelebration?: (text: string) => void;
}

const NeonSnake: React.FC<NeonSnakeProps> = ({
  gameState,
  setGameState,
  onStatusChange,
  useAI,
  onCelebration,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Snake grid parameters: 24 cols x 16 rows (20px cells)
  const cols = 24;
  const rows = 16;
  const cellSize = 20;

  // Game states stored in refs for the loop
  const snake = useRef<Point[]>([]);
  const direction = useRef<Point>({ x: 1, y: 0 }); // moving right initially
  const food = useRef<Point>({ x: 5, y: 5 });
  const score = useRef<number>(0);
  const snakeLength = useRef<number>(3);
  
  // Game update speed (lower is faster)
  const baseSpeedMs = useRef<number>(180);
  const minSpeedMs = useRef<number>(70);
  const lastUpdateTime = useRef<number>(0);

  // Initialize/Reset
  const initGame = () => {
    snake.current = [
      { x: 5, y: 8 },
      { x: 4, y: 8 },
      { x: 3, y: 8 },
    ];
    direction.current = { x: 1, y: 0 };
    score.current = 0;
    snakeLength.current = 3;
    baseSpeedMs.current = 180;
    spawnFood();
    onStatusChange({ score: 0, length: 3 });
  };

  const spawnFood = () => {
    // Generate food coords that aren't on the snake body
    let fx = 0;
    let fy = 0;
    let valid = false;
    while (!valid) {
      fx = Math.floor(Math.random() * cols);
      fy = Math.floor(Math.random() * rows);
      valid = !snake.current.some((segment) => segment.x === fx && segment.y === fy);
    }
    food.current = { x: fx, y: fy };
  };

  useEffect(() => {
    if (gameState === 'playing') {
      initGame();
    }
  }, [gameState]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing' || useAI) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      const dir = direction.current;
      if ((e.key === 'ArrowUp' || e.key === 'w') && dir.y === 0) {
        direction.current = { x: 0, y: -1 };
        sound.playGameTone(300, 0.04, 'triangle');
      } else if ((e.key === 'ArrowDown' || e.key === 's') && dir.y === 0) {
        direction.current = { x: 0, y: 1 };
        sound.playGameTone(300, 0.04, 'triangle');
      } else if ((e.key === 'ArrowLeft' || e.key === 'a') && dir.x === 0) {
        direction.current = { x: -1, y: 0 };
        sound.playGameTone(300, 0.04, 'triangle');
      } else if ((e.key === 'ArrowRight' || e.key === 'd') && dir.x === 0) {
        direction.current = { x: 1, y: 0 };
        sound.playGameTone(300, 0.04, 'triangle');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, useAI]);

  // BFS Pathfinding AI for Snake Autopilot
  const findNextAiMove = (): Point | null => {
    const head = snake.current[0];
    const target = food.current;

    // Helper to serialize points
    const key = (p: Point) => `${p.x},${p.y}`;

    // Queue for BFS: [point, path_array]
    const queue: [Point, Point[]][] = [[head, []]];
    const visited = new Set<string>([key(head)]);

    // Mark snake body as blocked
    snake.current.slice(1).forEach((seg) => visited.add(key(seg)));

    const dirs = [
      { x: 0, y: -1 }, // Up
      { x: 0, y: 1 },  // Down
      { x: -1, y: 0 }, // Left
      { x: 1, y: 0 },  // Right
    ];

    while (queue.length > 0) {
      const [curr, path] = queue.shift()!;
      if (curr.x === target.x && curr.y === target.y) {
        return path[0] || null; // return first step of path
      }

      for (const d of dirs) {
        const next: Point = { x: curr.x + d.x, y: curr.y + d.y };
        
        // Grid bounds boundary check
        if (next.x >= 0 && next.x < cols && next.y >= 0 && next.y < rows) {
          const nKey = key(next);
          if (!visited.has(nKey)) {
            visited.add(nKey);
            queue.push([next, [...path, d]]);
          }
        }
      }
    }

    // Fallback: If no direct path to food, pick any safe adjacent move
    for (const d of dirs) {
      const next: Point = { x: head.x + d.x, y: head.y + d.y };
      if (next.x >= 0 && next.x < cols && next.y >= 0 && next.y < rows) {
        if (!snake.current.some((seg) => seg.x === next.x && seg.y === next.y)) {
          return d;
        }
      }
    }

    return null; // Certain death
  };

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const gameTick = () => {
      if (gameState !== 'playing') return;

      const head = snake.current[0];
      
      // Update direction if using AI Autopilot
      if (useAI) {
        const nextDir = findNextAiMove();
        if (nextDir) {
          direction.current = nextDir;
        }
      }

      const nextHead = {
        x: head.x + direction.current.x,
        y: head.y + direction.current.y,
      };

      // 1. Boundary / Tail collision check
      const hitWall = nextHead.x < 0 || nextHead.x >= cols || nextHead.y < 0 || nextHead.y >= rows;
      const hitSelf = snake.current.some((seg) => seg.x === nextHead.x && seg.y === nextHead.y);

      if (hitWall || hitSelf) {
        sound.playGameTone(150, 0.45, 'triangle');
        setGameState('gameover');
        return;
      }

      // Add new head segment
      snake.current.unshift(nextHead);

      // 2. Check if eating food
      if (nextHead.x === food.current.x && nextHead.y === food.current.y) {
        score.current += 10;
        snakeLength.current += 1;
        
        sound.playGameTone(700, 0.08, 'sine');
        spawnFood();

        onStatusChange({ score: score.current, length: snakeLength.current });
        
        if (snakeLength.current >= 15 && snakeLength.current % 5 === 0 && onCelebration) {
          onCelebration(`🔥 Size: ${snakeLength.current}!`);
        }
      } else {
        // Remove tail segment if not growing
        snake.current.pop();
      }
    };

    const draw = (timestamp: number) => {
      // CRT neon glow background
      ctx.fillStyle = 'rgba(8, 8, 8, 0.45)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw faint gridlines
      ctx.strokeStyle = 'rgba(255, 123, 0, 0.035)';
      ctx.lineWidth = 1;
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        ctx.moveTo(c * cellSize, 0);
        ctx.lineTo(c * cellSize, canvas.height);
        ctx.stroke();
      }
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * cellSize);
        ctx.lineTo(canvas.width, r * cellSize);
        ctx.stroke();
      }

      // Perform physics update tick based on elapsed speed time
      const speedMs = Math.max(minSpeedMs.current, baseSpeedMs.current - (snakeLength.current * 4));
      if (timestamp - lastUpdateTime.current > speedMs) {
        lastUpdateTime.current = timestamp;
        gameTick();
      }

      // Draw food pellet (Neon Gold star/circle)
      ctx.fillStyle = '#ffd000';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ffd000';
      ctx.beginPath();
      ctx.arc(
        food.current.x * cellSize + cellSize / 2,
        food.current.y * cellSize + cellSize / 2,
        6,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Draw snake body with color gradient and glow
      snake.current.forEach((seg, idx) => {
        const isHead = idx === 0;
        
        ctx.fillStyle = isHead ? '#ffd000' : '#ff7b00';
        if (isHead) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ffd000';
        }
        
        ctx.beginPath();
        ctx.roundRect(
          seg.x * cellSize + 2,
          seg.y * cellSize + 2,
          cellSize - 4,
          cellSize - 4,
          isHead ? 5 : 3
        );
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    // Mobile swipe gestures logic
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (gameState !== 'playing' || useAI) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 40 && direction.current.x === 0) {
          direction.current = { x: 1, y: 0 };
          sound.playGameTone(300, 0.04, 'triangle');
        } else if (diffX < -40 && direction.current.x === 0) {
          direction.current = { x: -1, y: 0 };
          sound.playGameTone(300, 0.04, 'triangle');
        }
      } else {
        // Vertical swipe
        if (diffY > 40 && direction.current.y === 0) {
          direction.current = { x: 0, y: 1 };
          sound.playGameTone(300, 0.04, 'triangle');
        } else if (diffY < -40 && direction.current.y === 0) {
          direction.current = { x: 0, y: -1 };
          sound.playGameTone(300, 0.04, 'triangle');
        }
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
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

export default NeonSnake;
