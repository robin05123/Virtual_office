import React, { useRef, useEffect } from "react";

const PARTICLE_COUNT = 60;
const COLORS = ["#fff", "#38bdf8", "#fbbf24", "#a3e635", "#f472b6"];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

export default function ParticleBackground() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationId;

    canvas.width = width;
    canvas.height = height;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    window.addEventListener("resize", resize);

    // Particle definition
    const particles = Array.from({ length: PARTICLE_COUNT }).map(() => ({
      x: randomBetween(0, width),
      y: randomBetween(0, height),
      r: randomBetween(1.5, 3.5),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: randomBetween(0.2, 0.7),
      angle: randomBetween(0, 2 * Math.PI),
      drift: randomBetween(-0.2, 0.2),
      opacity: randomBetween(0.3, 0.9),
    }));

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();

        // Animate
        p.y -= p.speed;
        p.x += Math.sin(p.angle) * p.drift;
        p.angle += randomBetween(-0.01, 0.01);

        // Respawn at bottom if out of view
        if (p.y < -10) {
          p.x = randomBetween(0, width);
          p.y = height + 10;
          p.r = randomBetween(1.5, 3.5);
          p.color = COLORS[Math.floor(Math.random() * COLORS.length)];
          p.speed = randomBetween(0.2, 0.7);
          p.drift = randomBetween(-0.2, 0.2);
          p.opacity = randomBetween(0.3, 0.9);
        }
      }
      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
}