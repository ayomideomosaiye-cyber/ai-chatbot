import React, { useRef, useEffect } from 'react';

export default function NeuralCoreCanvas({ width = 280, height = 220 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Generate node points in an organic neural constellation
    const pointsCount = 42;
    const points = [];
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < pointsCount; i++) {
      const angle = (i / pointsCount) * Math.PI * 2;
      const radius = 35 + Math.random() * 50;
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * (radius * 0.75),
        baseX: centerX + Math.cos(angle) * radius,
        baseY: centerY + Math.sin(angle) * (radius * 0.75),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: 1.5 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
        color: i % 2 === 0 ? '#00f5d4' : '#7b2cbf'
      });
    }

    let mouseX = centerX;
    let mouseY = centerY;
    let isHovering = false;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      isHovering = true;
    };

    const handleMouseLeave = () => {
      isHovering = false;
      mouseX = centerX;
      mouseY = centerY;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let tick = 0;

    const render = () => {
      tick += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Draw faint center glow
      const glowGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 90);
      glowGrad.addColorStop(0, 'rgba(0, 245, 212, 0.12)');
      glowGrad.addColorStop(0.5, 'rgba(123, 44, 191, 0.08)');
      glowGrad.addColorStop(1, 'rgba(8, 8, 15, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Update and draw connections
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 55) {
            const alpha = (1 - dist / 55) * 0.35;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.strokeStyle = i % 3 === 0 
              ? `rgba(0, 245, 212, ${alpha})` 
              : `rgba(123, 44, 191, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Update and draw points
      points.forEach((pt) => {
        // Floating organic drift
        pt.x += Math.cos(tick + pt.phase) * 0.3 + pt.vx;
        pt.y += Math.sin(tick + pt.phase) * 0.3 + pt.vy;

        // Subtle pull towards mouse if hovering
        if (isHovering) {
          const mdx = mouseX - pt.x;
          const mdy = mouseY - pt.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < 80 && mDist > 5) {
            pt.x += (mdx / mDist) * 0.6;
            pt.y += (mdy / mDist) * 0.6;
          }
        }

        // Soft pull back to base orbit
        pt.x += (pt.baseX - pt.x) * 0.02;
        pt.y += (pt.baseY - pt.y) * 0.02;

        // Draw particle
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Central symbol / core text
      ctx.font = '600 11px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.textAlign = 'center';
      ctx.fillText('MATRIX', centerX, centerY + 65);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [width, height]);

  return (
    <div className="neural-canvas-wrap">
      <canvas 
        ref={canvasRef} 
        style={{ width: `${width}px`, height: `${height}px`, display: 'block' }}
        title="Interactive Neural Intelligence Core"
      />
    </div>
  );
}
