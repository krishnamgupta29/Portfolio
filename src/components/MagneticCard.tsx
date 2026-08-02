import React, { useRef, useState, useEffect } from 'react';

interface MagneticCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum tilt rotation in degrees
  maxPull?: number; // Maximum magnetic displacement in pixels
  active?: boolean; // Set to false to disable effect (e.g. on mobile)
}

const MagneticCard: React.FC<MagneticCardProps> = ({
  children,
  className = '',
  maxTilt = 10,
  maxPull = 8,
  active = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>('translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg)');
  const [glowStyle, setGlowStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMotionChange);
    return () => mediaQuery.removeEventListener('change', handleMotionChange);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!active || reducedMotion || !cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Mouse position relative to the element
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Center coordinates
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Normalised delta (-1 to 1)
    const deltaX = (x - centerX) / centerX;
    const deltaY = (y - centerY) / centerY;

    // Calculate Tilt (rotation)
    const rotX = -deltaY * maxTilt;
    const rotY = deltaX * maxTilt;

    // Calculate Magnetic Pull (translation)
    const pullX = deltaX * maxPull;
    const pullY = deltaY * maxPull;

    setTransform(`translate3d(${pullX}px, ${pullY}px, 0px) rotateX(${rotX}deg) rotateY(${rotY}deg)`);

    // Update glow border gradient position
    setGlowStyle({
      opacity: 1,
      background: `radial-gradient(circle 120px at ${x}px ${y}px, rgba(255, 123, 0, 0.25), transparent 70%)`,
    });
  };

  const handleMouseLeave = () => {
    if (!active || reducedMotion) return;
    
    // Smoothly transition back to center
    setTransform('translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg)');
    setGlowStyle({
      opacity: 0,
      transition: 'opacity 0.5s ease',
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl transition-all duration-300 ease-out select-none ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        transform: transform,
        transition: active && !reducedMotion ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
    >
      {/* Dynamic Hover Glow border overlay */}
      {active && !reducedMotion && (
        <div
          className="absolute -inset-[1px] rounded-2xl pointer-events-none opacity-0 z-10 transition-opacity duration-300 mix-blend-screen"
          style={glowStyle}
        />
      )}
      <div style={{ transform: 'translateZ(10px)', transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </div>
  );
};

export default MagneticCard;
