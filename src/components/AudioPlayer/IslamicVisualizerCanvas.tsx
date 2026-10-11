import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  isPlaying: boolean;
}

export const IslamicVisualizerCanvas: React.FC<VisualizerProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const isMobile = width < 640;

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Star field (60fps optimized particle count)
    const starsCount = isMobile ? 35 : 70;
    const stars = Array.from({ length: starsCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.75,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random(),
      speed: Math.random() * 0.015 + 0.005
    }));

    // Audio-reactive golden floating particles
    const particleCount = isMobile ? 15 : 35;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1,
      vy: -(Math.random() * 0.4 + 0.1),
      vx: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.6 + 0.2
    }));

    let rotationAngle = 0;
    let pulseScale = 1;

    const drawMoon = (x: number, y: number, radius: number) => {
      // Soft Radial Glow
      const glowGrad = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius * 2.5);
      glowGrad.addColorStop(0, 'rgba(255, 248, 220, 0.35)');
      glowGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.12)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Crescent Moon Body
      ctx.save();
      ctx.fillStyle = '#fff9e6';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0.5 * Math.PI, 1.5 * Math.PI, true);
      ctx.arc(x + radius * 0.4, y, radius * 0.8, 1.5 * Math.PI, 0.5 * Math.PI, false);
      ctx.fill();
      ctx.restore();
    };

    // Draw Islamic 8-Pointed Star (Rub el Hizb symbol)
    const drawIslamicStar = (cx: number, cy: number, outerRadius: number, angle: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.22)';
      ctx.lineWidth = 1.5;

      // Square 1
      ctx.strokeRect(-outerRadius, -outerRadius, outerRadius * 2, outerRadius * 2);

      // Square 2 rotated 45 deg
      ctx.rotate(Math.PI / 4);
      ctx.strokeRect(-outerRadius, -outerRadius, outerRadius * 2, outerRadius * 2);

      // Inner Circle
      ctx.beginPath();
      ctx.arc(0, 0, outerRadius * 0.65, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
      ctx.stroke();

      ctx.restore();
    };

    const render = () => {
      // Midnight Navy Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#030d14');
      bgGrad.addColorStop(0.5, '#071824');
      bgGrad.addColorStop(1, '#02090e');

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle pulse effect on play
      pulseScale = isPlaying ? 1 + Math.sin(Date.now() * 0.003) * 0.03 : 1;

      // Draw Rotating Rub el Hizb Star
      rotationAngle += isPlaying ? 0.0018 : 0.0004;
      const starSize = Math.min(width, height) * 0.35 * pulseScale;
      drawIslamicStar(width * 0.5, height * 0.45, starSize, rotationAngle);
      drawIslamicStar(width * 0.5, height * 0.45, starSize * 1.25, -rotationAngle * 0.7);

      // Draw Stars
      stars.forEach((star) => {
        star.alpha += star.speed;
        const currentAlpha = (Math.sin(star.alpha) + 1) / 2;
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha * 0.85})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Crescent Moon
      drawMoon(width * 0.82, height * 0.22, Math.min(width, height) * 0.075);

      // Draw Audio-Reactive Particles
      particles.forEach((p) => {
        p.y += p.vy * (isPlaying ? 1.6 : 0.7);
        p.x += p.vx;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha * (isPlaying ? 1.2 : 0.8)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * (isPlaying ? 1.3 : 1), 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
};
