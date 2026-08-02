import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 450;

// Procedural shape coordinate calculators
const getBrainPos = (i: number) => {
  const theta = (i / PARTICLE_COUNT) * Math.PI * 2 * 12; // spiral pattern
  const phi = Math.acos((i / PARTICLE_COUNT) * 2 - 1);
  const R = 1.6 + 0.25 * Math.sin(5 * theta) * Math.cos(5 * phi);
  const x = R * Math.cos(theta) * Math.sin(phi);
  const y = R * Math.sin(theta) * Math.sin(phi) * 1.3;
  const z = R * Math.cos(phi);
  return [x, y, z];
};

const getCubePos = (i: number) => {
  const face = i % 6;
  const u = (Math.random() * 2 - 1) * 1.2;
  const v = (Math.random() * 2 - 1) * 1.2;
  const size = 1.2;
  switch (face) {
    case 0: return [size, u, v];
    case 1: return [-size, u, v];
    case 2: return [u, size, v];
    case 3: return [u, -size, v];
    case 4: return [u, v, size];
    default: return [u, v, -size];
  }
};

const getTrophyPos = (i: number) => {
  if (i < 180) {
    // Cup cone
    const y = (i / 180) * 0.9;
    const theta = (i / 180) * Math.PI * 2 * 8;
    const r = 0.35 + 0.45 * y;
    return [r * Math.cos(theta), y - 0.1, r * Math.sin(theta)];
  } else if (i < 280) {
    // Handles (sides)
    const side = i % 2 === 0 ? 1 : -1;
    const angle = ((i - 180) / 100) * Math.PI - Math.PI / 2;
    const r = 0.35;
    const x = side * (0.55 + r * Math.cos(angle));
    const y = 0.25 + r * Math.sin(angle);
    return [x, y, 0];
  } else if (i < 340) {
    // Stem
    const y = -0.1 - ((i - 280) / 60) * 0.6;
    const theta = ((i - 280) / 60) * Math.PI * 2 * 4;
    const r = 0.1;
    return [r * Math.cos(theta), y, r * Math.sin(theta)];
  } else {
    // Base
    const index = i - 340;
    const r = (index / 110) * 0.7;
    const theta = index * Math.PI * 2 * 6;
    return [r * Math.cos(theta), -0.7 - (Math.random() * 0.08), r * Math.sin(theta)];
  }
};

const getPaperPlanePos = (i: number) => {
  const part = i % 4;
  const t = Math.random();
  const w = Math.random();
  const nose = [0, 1.1, 0];
  const tail = [0, -0.9, -0.2];
  
  const cy = nose[1] + t * (tail[1] - nose[1]);
  const cz = nose[2] + t * (tail[2] - nose[2]);

  if (part === 0) {
    // Left Wing
    const tipX = -1.2;
    const tipY = -0.7;
    const tipZ = 0.3;
    return [w * tipX, cy + w * (tipY - cy), cz + w * (tipZ - cz)];
  } else if (part === 1) {
    // Right Wing
    const tipX = 1.2;
    const tipY = -0.7;
    const tipZ = 0.3;
    return [w * tipX, cy + w * (tipY - cy), cz + w * (tipZ - cz)];
  } else if (part === 2) {
    // Left fold
    const foldX = -0.2;
    const foldY = -0.8;
    const foldZ = -0.1;
    return [w * foldX, cy + w * (foldY - cy), cz + w * (foldZ - cz)];
  } else {
    // Right fold
    const foldX = 0.2;
    const foldY = -0.8;
    const foldZ = -0.1;
    return [w * foldX, cy + w * (foldY - cy), cz + w * (foldZ - cz)];
  }
};

// Generate standard geometry structures for morphing
const targetPositions = [
  new Float32Array(PARTICLE_COUNT * 3), // Brain (Hero)
  new Float32Array(PARTICLE_COUNT * 3), // Cube (Skills)
  new Float32Array(PARTICLE_COUNT * 3), // Trophy (Hackathons)
  new Float32Array(PARTICLE_COUNT * 3), // Paper Plane (Contact)
];

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const b = getBrainPos(i);
  targetPositions[0][i * 3] = b[0];
  targetPositions[0][i * 3 + 1] = b[1];
  targetPositions[0][i * 3 + 2] = b[2];

  const c = getCubePos(i);
  targetPositions[1][i * 3] = c[0];
  targetPositions[1][i * 3 + 1] = c[1];
  targetPositions[1][i * 3 + 2] = c[2];

  const t = getTrophyPos(i);
  targetPositions[2][i * 3] = t[0];
  targetPositions[2][i * 3 + 1] = t[1];
  targetPositions[2][i * 3 + 2] = t[2];

  const p = getPaperPlanePos(i);
  targetPositions[3][i * 3] = p[0];
  targetPositions[3][i * 3 + 1] = p[1];
  targetPositions[3][i * 3 + 2] = p[2];
}

// Background custom shader
const BackgroundShader: React.FC<{ mouse: { x: number; y: number }; isLight: boolean }> = ({ mouse, isLight }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useRef({
    u_time: { value: 0 },
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    u_isLight: { value: 0.0 }
  });

  useEffect(() => {
    uniforms.current.u_isLight.value = isLight ? 1.0 : 0.0;
  }, [isLight]);

  useFrame((state) => {
    if (meshRef.current) {
      uniforms.current.u_time.value = state.clock.getElapsedTime();
      
      const targetMouseX = (mouse.x + 1) / 2;
      const targetMouseY = (mouse.y + 1) / 2;
      uniforms.current.u_mouse.value.x += (targetMouseX - uniforms.current.u_mouse.value.x) * 0.05;
      uniforms.current.u_mouse.value.y += (targetMouseY - uniforms.current.u_mouse.value.y) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -4]}>
      <planeGeometry args={[16, 10]} />
      <shaderMaterial
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float u_time;
          uniform vec2 u_mouse;
          uniform float u_isLight;
          varying vec2 vUv;

          void main() {
            vec2 uv = vUv;
            
            // Simulating fluid metaball centers
            vec2 p1 = vec2(0.25, 0.3) + 0.15 * vec2(cos(u_time * 0.35), sin(u_time * 0.25));
            vec2 p2 = vec2(0.75, 0.65) + 0.18 * vec2(sin(u_time * 0.25), cos(u_time * 0.45));
            vec2 p3 = u_mouse;

            float d1 = length(uv - p1);
            float d2 = length(uv - p2);
            float d3 = length(uv - p3);

            float f = 0.07 / (d1 + 0.1);
            f += 0.09 / (d2 + 0.12);
            f += 0.06 / (d3 + 0.08);

            // Subtle noise waves
            f += sin(uv.x * 8.0 + u_time * 0.4) * 0.015;
            f += cos(uv.y * 8.0 + u_time * 0.4) * 0.015;

            // Harvest orange gradient
            vec3 col1 = vec3(1.0, 0.48, 0.0); // #ff7b00
            vec3 col2 = vec3(1.0, 0.81, 0.0); // #ffd000
            
            // Adjust background colors for dark/light modes
            vec3 bgDark = vec3(0.024, 0.024, 0.024); // #060606
            vec3 bgLight = vec3(0.968, 0.96, 0.941); // #f7f5f0
            vec3 bg = mix(bgDark, bgLight, u_isLight);

            vec3 color = mix(bg, col1, smoothstep(0.4, 0.85, f));
            color = mix(color, col2, smoothstep(0.85, 1.4, f));

            float opacity = mix(0.12, 0.07, u_isLight);
            gl_FragColor = vec4(color, opacity);
          }
        `}
        uniforms={uniforms.current}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
};

// Morphing particles component
const MorphingParticles: React.FC<{ activeIndex: number }> = ({ activeIndex }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  // Set initial position array (copy of Brain pos)
  const initialPos = useRef(new Float32Array(targetPositions[0]));

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const positionsAttr = pointsRef.current.geometry.attributes.position;
    const currentArr = positionsAttr.array as Float32Array;
    const targetArr = targetPositions[activeIndex];
    
    let needsUpdate = false;
    const lerpSpeed = 0.08;

    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
      const diff = targetArr[i] - currentArr[i];
      if (Math.abs(diff) > 0.0001) {
        currentArr[i] += diff * lerpSpeed;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      positionsAttr.needsUpdate = true;
    }

    // Auto rotate the group slowly
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[initialPos.current, 3]}
            count={PARTICLE_COUNT}
            array={initialPos.current}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ff8800"
          size={0.065}
          sizeAttenuation={true}
          transparent={true}
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

// Main canvas component
const Morphing3DCanvas: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [mouse, setMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isLight, setIsLight] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check mobile fallback & light mode
  useEffect(() => {
    const handleCheck = () => {
      const touchSupport =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth < 768 ||
        window.matchMedia('(pointer: coarse)').matches;
      setIsMobile(touchSupport);

      setIsLight(document.documentElement.classList.contains('light'));
    };

    handleCheck();
    window.addEventListener('resize', handleCheck);

    // Watch dark/light mode switches
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains('light'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      window.removeEventListener('resize', handleCheck);
      observer.disconnect();
    };
  }, []);

  // Track Mouse Move
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Norm coordinates -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMouse({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  // Track Scroll
  useEffect(() => {
    const handleScroll = () => {
      // Section triggers mapping
      const triggers = ['hero', 'skills-section', 'hackathons-section', 'contact-section'];
      let activeIdx = 0;
      let minDiff = Infinity;

      triggers.forEach((id, index) => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Distance from screen center
          const diff = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);
          if (diff < minDiff) {
            minDiff = diff;
            activeIdx = index;
          }
        }
      });

      setActiveIndex(activeIdx);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Responsive shifts on desktop
  const getCameraPosition = (): [number, number, number] => {
    return [0, 0, 4.5];
  };

  const getPositionOffset = (): [number, number, number] => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      // Shift to the right side on larger screens to make space for hero/section texts
      return [1.1, 0, 0];
    }
    return [0, 0, 0];
  };

  if (isMobile) {
    // 2D Canvas particle fallback for mobile / low-end devices
    return <MobileCanvasFallback isLight={isLight} />;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none select-none overflow-hidden"
    >
      <Canvas
        camera={{ position: getCameraPosition(), fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <BackgroundShader mouse={mouse} isLight={isLight} />
        <group position={getPositionOffset()}>
          <MorphingParticles activeIndex={activeIndex} />
        </group>
      </Canvas>
    </div>
  );
};

// 2D Canvas Fallback for Mobile (Lightweight neural-mesh background)
const MobileCanvasFallback: React.FC<{ isLight: boolean }> = ({ isLight }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Watch resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Simple floating dots
    const dotsCount = 45;
    const dots: Array<{ x: number; y: number; vx: number; vy: number; r: number }> = [];
    for (let i = 0; i < dotsCount; i++) {
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Render simple gradient blobs underlay
      const gradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        10,
        width * 0.5,
        height * 0.4,
        width * 0.7
      );
      if (isLight) {
        gradient.addColorStop(0, 'rgba(255, 123, 0, 0.08)');
        gradient.addColorStop(1, 'rgba(247, 245, 240, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(255, 123, 0, 0.05)');
        gradient.addColorStop(1, 'rgba(6, 6, 6, 0)');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Render connecting lines & dots
      ctx.fillStyle = '#ff8800';
      ctx.strokeStyle = isLight ? 'rgba(255, 123, 0, 0.08)' : 'rgba(255, 123, 0, 0.12)';
      ctx.lineWidth = 0.8;

      for (let i = 0; i < dotsCount; i++) {
        const d = dots[i];
        d.x += d.vx;
        d.y += d.vy;

        // Bounce borders
        if (d.x < 0 || d.x > width) d.vx *= -1;
        if (d.y < 0 || d.y > height) d.vy *= -1;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();

        // Connect lines
        for (let j = i + 1; j < dotsCount; j++) {
          const d2 = dots[j];
          const dist = Math.hypot(d.x - d2.x, d.y - d2.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d2.x, d2.y);
            ctx.stroke();
          }
        }
      }

      animFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameId);
    };
  }, [isLight]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10 pointer-events-none" />;
};

export default Morphing3DCanvas;
