import React, { useRef, useEffect } from 'react';
import sound from '../../utils/sound';

interface SecurityNode {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  activeColor: string;
  soundFreq: number;
  label: string;
}

interface GateCrackerProps {
  gameState: 'idle' | 'playing' | 'gameover' | 'victory';
  setGameState: (state: 'idle' | 'playing' | 'gameover' | 'victory') => void;
  onStatusChange: (status: { score: number; lives?: number; round?: number }) => void;
  useAI: boolean;
  onCelebration?: (text: string) => void;
}

const GateCracker: React.FC<GateCrackerProps> = ({
  gameState,
  setGameState,
  onStatusChange,
  useAI,
  onCelebration,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Score represents cracking status
  const scoreRef = useRef<number>(0);
  const currentRound = useRef<number>(1);
  const totalRounds = 4; // 4 rounds to fully crack the gate

  const sequence = useRef<number[]>([]);
  const playerSequence = useRef<number[]>([]);
  
  // Game control substate: 'displaying' | 'player_turn' | 'result_pause'
  const subState = useRef<'displaying' | 'player_turn' | 'result_pause'>('displaying');
  const activeNodeId = useRef<number | null>(null); // currently glowing node
  
  // Animation/timing indices
  const displayIndex = useRef<number>(0);
  const lastStepTime = useRef<number>(0);
  const stepDelay = useRef<number>(700); // ms between flashes

  // Node grid layout (4 panels)
  const nodes: SecurityNode[] = [
    { id: 0, x: 50, y: 30, width: 160, height: 110, color: 'rgba(255, 123, 0, 0.1)', activeColor: '#ff7b00', soundFreq: 330, label: 'SECTOR-ALPHA' },
    { id: 1, x: 270, y: 30, width: 160, height: 110, color: 'rgba(255, 208, 0, 0.1)', activeColor: '#ffd000', soundFreq: 440, label: 'SECTOR-BETA' },
    { id: 2, x: 50, y: 180, width: 160, height: 110, color: 'rgba(255, 162, 0, 0.1)', activeColor: '#ffa200', soundFreq: 550, label: 'SECTOR-GAMMA' },
    { id: 3, x: 270, y: 180, width: 160, height: 110, color: 'rgba(255, 234, 0, 0.1)', activeColor: '#ffea00', soundFreq: 660, label: 'SECTOR-DELTA' },
  ];

  // Initialize/Reset
  const startNewGame = () => {
    scoreRef.current = 0;
    currentRound.current = 1;
    sequence.current = [];
    playerSequence.current = [];
    subState.current = 'displaying';
    activeNodeId.current = null;
    displayIndex.current = 0;
    lastStepTime.current = performance.now();
    
    // Generate first sequence of length 3
    for (let i = 0; i < 3; i++) {
      sequence.current.push(Math.floor(Math.random() * 4));
    }
    
    onStatusChange({ score: 0, round: 1 });
  };

  useEffect(() => {
    if (gameState === 'playing') {
      startNewGame();
    }
  }, [gameState]);

  // Flash helper
  const triggerFlash = (nodeId: number, duration = 300) => {
    activeNodeId.current = nodeId;
    const node = nodes[nodeId];
    sound.playGameTone(node.soundFreq, duration / 1000, 'sine');
    
    setTimeout(() => {
      if (activeNodeId.current === nodeId) {
        activeNodeId.current = null;
      }
    }, duration);
  };

  // Player clicks panel
  const handleNodeClick = (nodeId: number) => {
    if (gameState !== 'playing' || subState.current !== 'player_turn') return;
    
    triggerFlash(nodeId, 250);
    playerSequence.current.push(nodeId);
    
    // Validate latest input
    const idx = playerSequence.current.length - 1;
    if (playerSequence.current[idx] !== sequence.current[idx]) {
      // Access Denied (failed)
      subState.current = 'result_pause';
      sound.playGameTone(110, 0.5, 'triangle');
      if (onCelebration) {
        onCelebration('🔒 ACCESS DENIED — Resetting');
      }
      setTimeout(() => {
        // Reset to round 1
        startNewGame();
      }, 1200);
      return;
    }

    // Check if round complete
    if (playerSequence.current.length === sequence.current.length) {
      subState.current = 'result_pause';
      scoreRef.current += currentRound.current * 25;
      
      if (currentRound.current === totalRounds) {
        // Victory!
        sound.playSuccess();
        if (onCelebration) {
          onCelebration('🔓 ACCESS GRANTED!');
        }
        setTimeout(() => {
          setGameState('victory');
        }, 800);
      } else {
        // Advance round
        sound.playGameTone(880, 0.15, 'sine');
        currentRound.current += 1;
        onStatusChange({ score: scoreRef.current, round: currentRound.current });
        
        if (onCelebration) {
          onCelebration(`⚡ Round ${currentRound.current} Ready!`);
        }

        setTimeout(() => {
          // Add one more random step to sequence
          sequence.current.push(Math.floor(Math.random() * 4));
          playerSequence.current = [];
          subState.current = 'displaying';
          displayIndex.current = 0;
          lastStepTime.current = performance.now();
        }, 1000);
      }
    }
  };

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const draw = (nowTime: number) => {
      // Clear canvas
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Simple grid border frame
      ctx.strokeStyle = 'rgba(255, 123, 0, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Handle sequence displaying steps
      if (gameState === 'playing' && subState.current === 'displaying') {
        const elapsed = nowTime - lastStepTime.current;
        if (elapsed > stepDelay.current) {
          lastStepTime.current = nowTime;
          if (displayIndex.current < sequence.current.length) {
            const nextNode = sequence.current[displayIndex.current];
            if (nextNode !== undefined) {
              triggerFlash(nextNode, 400);
              displayIndex.current += 1;
            }
          } else {
            // Sequence finished playing, hand over to player
            subState.current = 'player_turn';
          }
        }
      }

      // Handle AI autopilot mode
      if (gameState === 'playing' && subState.current === 'player_turn' && useAI) {
        // AI simulates player clicks with a natural delay
        const nextInputIdx = playerSequence.current.length;
        const targetNodeId = sequence.current[nextInputIdx];
        
        subState.current = 'result_pause'; // lock interaction
        setTimeout(() => {
          handleNodeClick(targetNodeId);
        }, 600);
      }

      // Draw all 4 security gate panels
      nodes.forEach((node) => {
        const isActive = activeNodeId.current === node.id;
        
        ctx.fillStyle = isActive ? node.activeColor : node.color;
        ctx.strokeStyle = isActive ? node.activeColor : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = isActive ? 3 : 1.5;

        // Apply glow effect if active
        if (isActive) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = node.activeColor;
        }

        ctx.beginPath();
        ctx.roundRect(node.x, node.y, node.width, node.height, 8);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // Draw sector labels inside
        ctx.fillStyle = isActive ? '#000000' : 'rgba(255, 255, 255, 0.35)';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x + node.width / 2, node.y + node.height / 2 + 3);
      });

      // Overlay status terminal text
      if (gameState === 'playing') {
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        
        let text = 'SECURE GATE LOCKED — MEMORIZE KEY';
        if (subState.current === 'player_turn') {
          text = useAI ? 'AI DECODING IN PROGRESS...' : 'CRACK KEY NOW: ENTER SEQUENCE';
        } else if (subState.current === 'result_pause' && activeNodeId.current === null) {
          text = 'ANALYZING ENCRYPTION KEYS...';
        }
        ctx.fillText(text, canvas.width / 2, canvas.height - 18);
      } else {
        // Static outline graphic
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CRACK SECURITY CODE BY MATCHING PATTERNS', canvas.width / 2, canvas.height - 18);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    // Click handler to match canvas coordinates to quadrant boxes
    const handleCanvasClick = (e: MouseEvent) => {
      if (gameState !== 'playing' || subState.current !== 'player_turn' || useAI) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

      // Find which node was clicked
      nodes.forEach((node) => {
        if (
          clickX >= node.x &&
          clickX <= node.x + node.width &&
          clickY >= node.y &&
          clickY <= node.y + node.height
        ) {
          handleNodeClick(node.id);
        }
      });
    };

    canvas.addEventListener('mousedown', handleCanvasClick);
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousedown', handleCanvasClick);
    };
  }, [gameState, useAI]);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={320}
      className="w-full h-full block cursor-crosshair"
    />
  );
};

export default GateCracker;
