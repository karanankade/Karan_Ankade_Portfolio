import React, { useEffect, useRef } from 'react';

export default function CyberCursorTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    const colors = ['#00f3ff', '#00ff88', '#9d4edd', '#ff007f'];

    const createParticle = (x, y, burst = false) => {
      const count = burst ? 12 : 2;
      for (let i = 0; i < count; i++) {
        const angle = burst ? Math.random() * Math.PI * 2 : Math.random() * Math.PI * 2;
        const speed = burst ? Math.random() * 4 + 1 : Math.random() * 1.2 + 0.3;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: burst ? Math.random() * 3 + 2 : Math.random() * 2 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: burst ? 0.02 + Math.random() * 0.02 : 0.03 + Math.random() * 0.02
        });
      }
    };

    const handleMouseMove = (e) => {
      createParticle(e.clientX, e.clientY, false);
    };

    const handleClick = (e) => {
      createParticle(e.clientX, e.clientY, true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 99999,
        opacity: 0.8
      }}
    />
  );
}
