import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Activity, Sparkles, RefreshCw } from 'lucide-react';
import * as THREE from 'three';

interface NodeData {
  id: number;
  layer: number;
  position: THREE.Vector3;
  mesh: THREE.Mesh;
  activation: number; // 0 to 1
  baseScale: number;
}

interface EdgeData {
  id: number;
  startNode: NodeData;
  endNode: NodeData;
  line: THREE.Line;
}

interface PulseData {
  edge: EdgeData;
  progress: number; // 0 to 1
  speed: number;
  mesh: THREE.Mesh;
}

// WebGL Availability Check
const checkWebGL = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
};

const NeuralNetwork3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Live telemetry metrics
  const [epoch, setEpoch] = useState<number>(247);
  const [loss, setLoss] = useState<number>(0.0312);
  const [accuracy, setAccuracy] = useState<number>(94.7);
  const [isTrainingPass, setIsTrainingPass] = useState<boolean>(false);

  // Check prefers-reduced-motion and WebGL
  useEffect(() => {
    setHasWebGL(checkWebGL());
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Periodic Telemetry Update (Ticking Stats)
  useEffect(() => {
    const timer = setInterval(() => {
      setEpoch((prev) => prev + 1);
      setLoss((prev) => Math.max(0.012, parseFloat((prev - 0.0004 + Math.random() * 0.0003).toFixed(4))));
      setAccuracy((prev) => Math.min(99.4, parseFloat((prev + 0.05 - Math.random() * 0.02).toFixed(1))));
      setIsTrainingPass(true);
      setTimeout(() => setIsTrainingPass(false), 1200);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Main 3D Three.js Engine Setup
  useEffect(() => {
    if (!hasWebGL || !containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 440;
    const height = 280;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0xff7b00, 2.5, 30);
    mainLight.position.set(2, 4, 6);
    scene.add(mainLight);

    const goldLight = new THREE.PointLight(0xffd700, 1.8, 25);
    goldLight.position.set(-4, -2, 4);
    scene.add(goldLight);

    // Group for 3D Auto-Rotation and Parallax Tilt
    const networkGroup = new THREE.Group();
    scene.add(networkGroup);

    // 3. Construct 4-Layer Neural Network
    const layerConfigs = [
      { layer: 0, x: -3.2, count: 4, spreadY: 2.2 },
      { layer: 1, x: -1.1, count: 6, spreadY: 2.8 },
      { layer: 2, x: 1.1, count: 6, spreadY: 2.8 },
      { layer: 3, x: 3.2, count: 4, spreadY: 2.2 },
    ];

    const nodes: NodeData[] = [];
    const edges: EdgeData[] = [];
    const pulses: PulseData[] = [];

    const nodeGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const pulseGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });

    let nodeId = 0;
    const nodesByLayer: NodeData[][] = [[], [], [], []];

    // Create Nodes
    layerConfigs.forEach((cfg) => {
      const stepY = cfg.count > 1 ? cfg.spreadY / (cfg.count - 1) : 0;
      const startY = -cfg.spreadY / 2;

      for (let i = 0; i < cfg.count; i++) {
        const posY = startY + i * stepY;
        const posZ = (Math.sin(i * 1.5 + cfg.layer) * 0.9); // Z depth dispersion

        const colorHex = cfg.layer === 0 ? 0xff7b00 : cfg.layer === 3 ? 0xffd700 : 0xffaa00;
        const mat = new THREE.MeshStandardMaterial({
          color: colorHex,
          emissive: colorHex,
          emissiveIntensity: 0.35,
          roughness: 0.2,
          metalness: 0.8,
        });

        const mesh = new THREE.Mesh(nodeGeo, mat);
        mesh.position.set(cfg.x, posY, posZ);
        networkGroup.add(mesh);

        const nodeObj: NodeData = {
          id: nodeId++,
          layer: cfg.layer,
          position: mesh.position.clone(),
          mesh,
          activation: 0,
          baseScale: 1.0,
        };

        nodes.push(nodeObj);
        nodesByLayer[cfg.layer].push(nodeObj);
      }
    });

    // Create Edges between adjacent layers
    let edgeId = 0;
    for (let l = 0; l < 3; l++) {
      const currentLayer = nodesByLayer[l];
      const nextLayer = nodesByLayer[l + 1];

      currentLayer.forEach((start) => {
        nextLayer.forEach((end) => {
          const points = [start.position, end.position];
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const lineMat = new THREE.LineBasicMaterial({
            color: 0xff7b00,
            transparent: true,
            opacity: 0.14,
          });

          const line = new THREE.Line(lineGeo, lineMat);
          networkGroup.add(line);

          const edgeObj: EdgeData = {
            id: edgeId++,
            startNode: start,
            endNode: end,
            line,
          };
          edges.push(edgeObj);
        });
      });
    }

    // Helper to spawn a pulse along an edge
    const spawnPulse = (edge: EdgeData, speedMultiplier = 1.0) => {
      const pMesh = new THREE.Mesh(pulseGeo, pulseMat.clone());
      pMesh.position.copy(edge.startNode.position);
      networkGroup.add(pMesh);

      pulses.push({
        edge,
        progress: 0,
        speed: (0.018 + Math.random() * 0.015) * speedMultiplier,
        mesh: pMesh,
      });
    };

    // Seed initial pulses
    for (let i = 0; i < 12; i++) {
      const randomEdge = edges[Math.floor(Math.random() * edges.length)];
      spawnPulse(randomEdge);
    }

    // 4. Static network rotation parameters
    let targetRotX = 0;
    let targetRotY = 0;

    // Handle Window Resize
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const w = containerRef.current.clientWidth || 440;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    // 5. Main Render Loop
    let animFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();

      if (!reducedMotion) {
        // Continuous slow auto-rotation + mouse parallax lerp
        networkGroup.rotation.y += 0.003;
        networkGroup.rotation.y += (targetRotY - networkGroup.rotation.y) * 0.05;
        networkGroup.rotation.x += (targetRotX - networkGroup.rotation.x) * 0.05;
      }

      // Update Node Activations (decay and scale pulse)
      nodes.forEach((node) => {
        if (node.activation > 0) {
          node.activation = Math.max(0, node.activation - delta * 2.5);
          const mat = node.mesh.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 0.35 + node.activation * 1.5;
          const scale = 1.0 + node.activation * 0.45;
          node.mesh.scale.set(scale, scale, scale);
        } else {
          node.mesh.scale.set(1, 1, 1);
        }
      });

      // Update Traveling Pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.progress += p.speed * (isHovered ? 1.5 : 1.0);

        if (p.progress >= 1.0) {
          // Pulse arrived at target node -> trigger activation flash
          p.edge.endNode.activation = 1.0;

          // Remove completed pulse mesh
          networkGroup.remove(p.mesh);
          p.mesh.geometry.dispose();
          (p.mesh.material as THREE.Material).dispose();
          pulses.splice(i, 1);

          // Chain next pulse along next layer if not output layer
          if (p.edge.endNode.layer < 3) {
            const outgoingEdges = edges.filter((e) => e.startNode.id === p.edge.endNode.id);
            if (outgoingEdges.length > 0) {
              const nextEdge = outgoingEdges[Math.floor(Math.random() * outgoingEdges.length)];
              spawnPulse(nextEdge);
            }
          } else {
            // Respawn new pulse at Input layer
            const inputEdges = edges.filter((e) => e.startNode.layer === 0);
            const respawnEdge = inputEdges[Math.floor(Math.random() * inputEdges.length)];
            spawnPulse(respawnEdge);
          }
        } else {
          // Lerp pulse position between start and end node
          p.mesh.position.lerpVectors(p.edge.startNode.position, p.edge.endNode.position, p.progress);
        }
      }

      // Keep minimum pulse count alive
      while (pulses.length < 10) {
        const randomEdge = edges[Math.floor(Math.random() * edges.length)];
        spawnPulse(randomEdge);
      }

      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      nodes.forEach((n) => {
        n.mesh.geometry.dispose();
        (n.mesh.material as THREE.Material).dispose();
      });
      edges.forEach((e) => {
        e.line.geometry.dispose();
        (e.line.material as THREE.Material).dispose();
      });
    };
  }, [hasWebGL, isHovered, reducedMotion]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 25 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full max-w-[480px] rounded-3xl border border-white/10 dark:border-white/10 light:border-black/10 bg-black/50 dark:bg-black/50 light:bg-white/80 backdrop-blur-xl p-5 shadow-[0_0_40px_rgba(255,123,0,0.14)] group overflow-hidden"
    >
      {/* Background radial glow inside frame */}
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 opacity-25 group-hover:opacity-50"
        style={{
          background: 'radial-gradient(circle, #ff7b00 0%, transparent 70%)',
        }}
      />

      {/* Header Chrome */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 dark:border-white/10 light:border-black/10">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isTrainingPass ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isTrainingPass ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          </span>
          <span className="text-[11px] font-display font-bold tracking-widest text-white/80 dark:text-white/80 light:text-black/80 uppercase flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-harvest-orange" />
            Model: Training (3D)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-harvest-orange bg-harvest-orange/10 border border-harvest-orange/20 rounded-md px-2 py-0.5 font-semibold flex items-center gap-1">
            {isTrainingPass && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
            {isTrainingPass ? 'PASS' : 'ACTIVE'}
          </span>
          <span className="text-[10px] font-mono text-white/40 dark:text-white/40 light:text-black/40">
            NET-3D
          </span>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[210px] rounded-2xl overflow-hidden bg-black/60 dark:bg-black/60 light:bg-black/10 border border-white/5 flex items-center justify-center"
      >
        {hasWebGL ? (
          <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />
        ) : (
          /* WebGL Fallback: Simple animated SVG network */
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            <Activity className="w-8 h-8 text-harvest-orange mb-2 animate-pulse" />
            <span className="text-xs font-mono text-white/60">Neural Network Active (2D Fallback)</span>
          </div>
        )}
      </div>

      {/* Live Telemetry Readout */}
      <div className="grid grid-cols-3 gap-2 pt-3 mt-2 border-t border-white/10 dark:border-white/10 light:border-black/10 text-left font-mono">
        <div>
          <span className="text-[9px] font-display uppercase tracking-wider text-white/40 block">Epoch</span>
          <span className="text-xs font-bold text-harvest-orange">#{epoch}</span>
        </div>
        <div>
          <span className="text-[9px] font-display uppercase tracking-wider text-white/40 block">Loss</span>
          <span className="text-xs font-bold text-gold">{loss}</span>
        </div>
        <div>
          <span className="text-[9px] font-display uppercase tracking-wider text-white/40 block">Accuracy</span>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 fill-emerald-400" /> {accuracy}%
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default NeuralNetwork3D;
