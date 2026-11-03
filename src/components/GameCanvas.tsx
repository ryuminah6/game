import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Donut, Particle, FloatingText, HamsterState, GameStatus } from '../types';
import { playMunchSound, playSickSound, playVictorySound } from '../audio';
import confetti from 'canvas-confetti';

interface GameCanvasProps {
  status: GameStatus;
  score: number;
  timeLeft: number;
  onScoreChange: (newScore: number) => void;
  onTimeChange: (newTime: number) => void;
  onGameOver: (score: number) => void;
  onVictory: (score: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  status,
  score,
  timeLeft,
  onScoreChange,
  onTimeChange,
  onGameOver,
  onVictory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mutable refs for high-frequency game loop
  const scoreRef = useRef(score);
  scoreRef.current = score;

  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  const statusRef = useRef(status);
  statusRef.current = status;

  const hamsterRef = useRef<HamsterState>({
    x: 200,
    y: 520,
    speed: 6.2,
    direction: 1,
    eatBounce: 0,
    wobble: 0,
  });

  const donutsRef = useRef<Donut[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const keysRef = useRef<{ ArrowLeft: boolean; ArrowRight: boolean }>({
    ArrowLeft: false,
    ArrowRight: false,
  });

  const [activeTouch, setActiveTouch] = useState<'left' | 'right' | null>(null);

  // Confetti trigger on victory
  useEffect(() => {
    if (status === 'VICTORY') {
      playVictorySound();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffb703', '#fb8500', '#ff6b6b', '#ffd166', '#ff85a1'],
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#ffb703', '#ff6b6b'],
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#ffb703', '#ff6b6b'],
          });
        }, 300);
      } catch {}
    } else if (status === 'GAMEOVER') {
      playSickSound();
    }
  }, [status]);

  // Particle creators
  const createCrumbs = useCallback((x: number, y: number, isGold: boolean) => {
    const colors = isGold
      ? ['#ffd166', '#ffb703', '#ffffff', '#faedcd', '#f4a261']
      : ['#ff6b6b', '#ff85a1', '#ffffff', '#faedcd', '#f4a261'];

    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 4.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 2.5 + Math.random() * 3.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        life: 0,
        maxLife: 25 + Math.random() * 15,
        shape: Math.random() > 0.6 ? 'star' : 'circle',
      });
    }

    // Add floating text
    const phrases = isGold
      ? ['+3 대박!', '황금 도넛! ✨', '최고야! ⭐']
      : ['+1 냠!', '볼 빵빵! 🐹', '맛있다! 🍩', '냠냠! 💕'];
    const text = phrases[Math.floor(Math.random() * phrases.length)];

    floatingTextsRef.current.push({
      id: Date.now() + Math.random(),
      x: x + (Math.random() - 0.5) * 20,
      y: y - 10,
      text,
      color: isGold ? '#d97706' : '#d81159',
      alpha: 1,
      scale: isGold ? 1.25 : 1,
      life: 0,
    });
  }, []);

  // Spawn Donut
  const spawnDonut = useCallback((canvasWidth: number, canvasHeight: number) => {
    if (statusRef.current !== 'PLAYING') return;

    const radius = 19;
    const x = radius + 15 + Math.random() * (canvasWidth - (radius + 15) * 2);

    // 68% regular Pink, 10% Gold, 22% Green (poisonous)
    const rand = Math.random();
    let type: Donut['type'] = 'PINK';
    if (rand < 0.22) {
      type = 'GREEN';
    } else if (rand < 0.32) {
      type = 'GOLD';
    }

    // Gentle progressive speed as timer runs down
    const progress = Math.max(0, (60 - timeLeftRef.current) / 60);
    const baseSpeed = (canvasHeight / 2.3) / 60; // falls top to bottom in ~2.3 sec
    const finalSpeed = baseSpeed * (1 + progress * 0.45);

    donutsRef.current.push({
      id: Date.now() + Math.random(),
      x,
      y: -radius - 5,
      radius,
      type,
      speed: finalSpeed,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.08,
    });
  }, []);

  // Main Canvas & Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let spawnTimerId: number | null = null;
    let clockTimerId: number | null = null;

    // Canvas sizing with Device Pixel Ratio for crystal sharp rendering
    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);

      // Reset hamster position within bounds
      hamsterRef.current.y = rect.height - 75;
      if (hamsterRef.current.x > rect.width - 30) {
        hamsterRef.current.x = rect.width / 2;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Keyboard controls
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.ArrowLeft = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.ArrowRight = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.ArrowLeft = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.ArrowRight = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Timers setup when PLAYING
    if (status === 'PLAYING') {
      // Donut spawn rate (every 750ms - 900ms)
      spawnTimerId = window.setInterval(() => {
        const container = containerRef.current;
        if (container) {
          spawnDonut(container.clientWidth, container.clientHeight);
        }
      }, 750);

      // 1-second game clock
      clockTimerId = window.setInterval(() => {
        if (statusRef.current !== 'PLAYING') return;
        const newTime = timeLeftRef.current - 1;
        onTimeChange(newTime);
        if (newTime <= 0) {
          onVictory(scoreRef.current);
        }
      }, 1000);
    }

    // Draw functions
    const drawBackground = (w: number, h: number) => {
      // Pastel Kitchen Wall
      const wallGrad = ctx.createLinearGradient(0, 0, 0, h * 0.72);
      wallGrad.addColorStop(0, '#fefae0');
      wallGrad.addColorStop(1, '#faedcd');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, w, h * 0.72);

      // Wall Tiles
      ctx.strokeStyle = 'rgba(212, 163, 89, 0.22)';
      ctx.lineWidth = 1;
      const tileSize = 38;
      for (let x = 0; x < w; x += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h * 0.72);
        ctx.stroke();
      }
      for (let y = 0; y < h * 0.72; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Cozy Kitchen Shelf at upper background
      ctx.fillStyle = '#e0a96d';
      ctx.fillRect(20, 85, w - 40, 8);
      ctx.fillStyle = '#c88a4b';
      ctx.fillRect(20, 93, w - 40, 3);
      // Small decorative jars on shelf
      ctx.fillStyle = 'rgba(255, 107, 107, 0.75)';
      ctx.fillRect(35, 68, 16, 17);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(37, 65, 12, 4);
      // Honey pot
      ctx.fillStyle = 'rgba(251, 133, 0, 0.8)';
      ctx.beginPath();
      ctx.arc(w - 50, 75, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d4a373';
      ctx.fillRect(w - 56, 62, 12, 4);

      // Kitchen Counter Floor
      const floorGrad = ctx.createLinearGradient(0, h * 0.72, 0, h);
      floorGrad.addColorStop(0, '#e9c46a');
      floorGrad.addColorStop(1, '#f4a261');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, h * 0.72, w, h * 0.28);

      // Floor separator & wood grain line
      ctx.strokeStyle = '#d4a373';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.72);
      ctx.lineTo(w, h * 0.72);
      ctx.stroke();

      // Soft Counter reflection
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(0, h * 0.72 + 3, w, 6);
    };

    const drawDonut = (d: Donut) => {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rotation);

      const r = d.radius;

      // Glow behind Gold donut
      if (d.type === 'GOLD') {
        ctx.save();
        ctx.shadowColor = '#fb8500';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(0, 0, r + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Dough Base
      ctx.fillStyle = d.type === 'GOLD' ? '#e59866' : '#f4a261';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Icing Top
      if (d.type === 'PINK') {
        ctx.fillStyle = '#ff6b6b';
      } else if (d.type === 'GOLD') {
        ctx.fillStyle = '#ffb703';
      } else {
        ctx.fillStyle = '#2d6a4f';
      }
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.94, 0, Math.PI * 2);
      ctx.fill();

      // Mold / Sprinkles
      if (d.type === 'GREEN') {
        ctx.fillStyle = '#1b4332';
        ctx.beginPath();
        ctx.arc(-6, -6, 3.2, 0, Math.PI * 2);
        ctx.arc(7, 4, 2.8, 0, Math.PI * 2);
        ctx.arc(-2, 8, 3.5, 0, Math.PI * 2);
        ctx.arc(4, -8, 2, 0, Math.PI * 2);
        ctx.fill();

        // Mold spore highlights
        ctx.fillStyle = '#74c69d';
        ctx.beginPath();
        ctx.arc(-7, -7, 1.2, 0, Math.PI * 2);
        ctx.arc(6, 3, 1.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (d.type === 'GOLD') {
        // Sparkling stars on gold donut
        const goldSprinkles = [
          { x: -6, y: -6, col: '#ffffff' },
          { x: 6, y: -6, col: '#fff3b0' },
          { x: 7, y: 5, col: '#ffffff' },
          { x: -5, y: 7, col: '#ffe6a7' },
        ];
        goldSprinkles.forEach((s) => {
          ctx.fillStyle = s.col;
          ctx.fillRect(s.x, s.y, 4, 2.5);
        });
      } else {
        // Sprinkles on pink donut
        const sprinkles = [
          { x: -7, y: -6, col: '#ffffff' },
          { x: 6, y: -7, col: '#ffea00' },
          { x: 8, y: 5, col: '#4cc9f0' },
          { x: -6, y: 7, col: '#ffffff' },
          { x: 0, y: -9, col: '#a7c957' },
        ];
        sprinkles.forEach((s) => {
          ctx.fillStyle = s.col;
          ctx.fillRect(s.x, s.y, 3.5, 1.8);
        });
      }

      // Donut Center Hole
      ctx.fillStyle = '#faedcd';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
      ctx.fill();

      // Outer outline (Thin 1.8px line art style)
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Hole Outline
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    };

    const drawHamster = (h: HamsterState, scoreCount: number) => {
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.scale(h.direction, 1);

      // Cheek puff grows with score up to 45px
      const cheekPuff = Math.min(scoreCount * 3.5, 45);

      // Bounce on eating & subtle walk wobble
      const bounceY = Math.sin(h.eatBounce * Math.PI) * -12;
      const wobbleRot = Math.sin(h.wobble) * 0.05;
      ctx.translate(0, bounceY);
      ctx.rotate(wobbleRot);

      // Thin stroke style matching the requested aesthetic
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#111111';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // Floor Shadow
      ctx.save();
      ctx.scale(1 / h.direction, 1);
      ctx.beginPath();
      ctx.ellipse(0, 36, 32 + cheekPuff * 0.3, 9, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fill();
      ctx.restore();

      // Feet
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-20 - cheekPuff * 0.15, 34, 11, 5, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(20 + cheekPuff * 0.15, 34, 11, 5, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Ears
      ctx.beginPath();
      ctx.arc(-24, -36, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#e67e22';
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(-24, -36, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#d35400';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(24, -36, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#e67e22';
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(24, -36, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#d35400';
      ctx.fill();

      // Main Body Head Shape
      const headW = 34 + cheekPuff * 0.65;
      ctx.beginPath();
      ctx.moveTo(-24, -36);
      ctx.bezierCurveTo(-headW, -24, -headW, 30, 0, 34);
      ctx.bezierCurveTo(headW, 30, headW, -24, 24, -36);
      ctx.bezierCurveTo(14, -42, -14, -42, -24, -36);
      ctx.fillStyle = '#e67e22';
      ctx.fill();
      ctx.stroke();

      // White Cheeks & Belly
      const cheekW = 28 + cheekPuff * 0.75;
      ctx.beginPath();
      ctx.moveTo(-16, -14);
      ctx.bezierCurveTo(-cheekW, -8, -cheekW, 30, 0, 32);
      ctx.bezierCurveTo(cheekW, 30, cheekW, -8, 16, -14);
      ctx.bezierCurveTo(10, -18, -10, -18, -16, -14);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.stroke();

      // Rosy Cheeks
      if (cheekPuff > 0) {
        ctx.fillStyle = 'rgba(255, 154, 162, 0.68)';
        ctx.beginPath();
        ctx.arc(-18 - cheekPuff * 0.3, 6, 7 + cheekPuff * 0.15, 0, Math.PI * 2);
        ctx.arc(18 + cheekPuff * 0.3, 6, 7 + cheekPuff * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dot Eyes
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.arc(-18 - cheekPuff * 0.1, -8, 5, 0, Math.PI * 2);
      ctx.arc(18 + cheekPuff * 0.1, -8, 5, 0, Math.PI * 2);
      ctx.fill();

      // Eye glimmer
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-19 - cheekPuff * 0.1, -10, 1.8, 0, Math.PI * 2);
      ctx.arc(17 + cheekPuff * 0.1, -10, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // W Mouth
      ctx.beginPath();
      ctx.moveTo(-7, 2);
      ctx.quadraticCurveTo(-3, 8, 0, 4);
      ctx.quadraticCurveTo(3, 8, 7, 2);
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Paws
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-9, 14, 6, 8, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(9, 14, 6, 8, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    const drawParticles = () => {
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravity
        p.rotation += p.rotSpeed;
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.life >= p.maxLife || p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.shape === 'star') {
          ctx.beginPath();
          for (let s = 0; s < 5; s++) {
            ctx.lineTo(
              Math.cos(((18 + s * 72) * Math.PI) / 180) * p.size,
              -Math.sin(((18 + s * 72) * Math.PI) / 180) * p.size
            );
            ctx.lineTo(
              Math.cos(((54 + s * 72) * Math.PI) / 180) * (p.size / 2),
              -Math.sin(((54 + s * 72) * Math.PI) / 180) * (p.size / 2)
            );
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    };

    const drawFloatingTexts = () => {
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i];
        ft.y -= 1.2;
        ft.life++;
        ft.alpha = Math.max(0, 1 - ft.life / 35);

        if (ft.life >= 35 || ft.alpha <= 0) {
          floatingTextsRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = `bold ${Math.floor(16 * ft.scale)}px 'Jua', 'Gowun Dodum', sans-serif`;
        ctx.textAlign = 'center';

        // Text shadow / outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeText(ft.text, ft.x, ft.y);

        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }
    };

    // Main animation step
    const step = () => {
      const container = containerRef.current;
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;

      // Update positions if playing
      if (statusRef.current === 'PLAYING') {
        const h = hamsterRef.current;
        let isMoving = false;

        if (keysRef.current.ArrowLeft) {
          h.x -= h.speed;
          h.direction = -1;
          isMoving = true;
        }
        if (keysRef.current.ArrowRight) {
          h.x += h.speed;
          h.direction = 1;
          isMoving = true;
        }

        if (isMoving) {
          h.wobble += 0.25;
        } else {
          h.wobble *= 0.8;
        }

        // Clamp boundaries
        const margin = 28;
        if (h.x < margin) h.x = margin;
        if (h.x > width - margin) h.x = width - margin;

        // Eat bounce decay
        if (h.eatBounce > 0) {
          h.eatBounce -= 0.08;
          if (h.eatBounce < 0) h.eatBounce = 0;
        }

        // Donuts loop & collision check
        for (let i = donutsRef.current.length - 1; i >= 0; i--) {
          const d = donutsRef.current[i];
          d.y += d.speed;
          d.rotation += d.rotSpeed;

          // Collision detection
          const dist = Math.hypot(h.x - d.x, h.y - d.y);
          if (dist < d.radius + 26) {
            if (d.type === 'PINK') {
              const newScore = scoreRef.current + 1;
              onScoreChange(newScore);
              h.eatBounce = 1.0;
              playMunchSound(false);
              createCrumbs(d.x, d.y, false);
              donutsRef.current.splice(i, 1);
            } else if (d.type === 'GOLD') {
              const newScore = scoreRef.current + 3;
              onScoreChange(newScore);
              h.eatBounce = 1.2;
              playMunchSound(true);
              createCrumbs(d.x, d.y, true);
              donutsRef.current.splice(i, 1);
            } else if (d.type === 'GREEN') {
              createCrumbs(d.x, d.y, false);
              donutsRef.current.splice(i, 1);
              onGameOver(scoreRef.current);
              return;
            }
          } else if (d.y > height + 40) {
            donutsRef.current.splice(i, 1);
          }
        }
      }

      // Draw all layers
      ctx.clearRect(0, 0, width, height);
      drawBackground(width, height);

      // Donuts
      for (const d of donutsRef.current) {
        drawDonut(d);
      }

      // Hamster
      drawHamster(hamsterRef.current, scoreRef.current);

      // Particles & Floating texts
      drawParticles();
      drawFloatingTexts();

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (spawnTimerId !== null) clearInterval(spawnTimerId);
      if (clockTimerId !== null) clearInterval(clockTimerId);
    };
  }, [status, onScoreChange, onTimeChange, onGameOver, onVictory, createCrumbs, spawnDonut]);

  // Touch control handlers
  const handleTouchStart = (dir: 'left' | 'right') => {
    setActiveTouch(dir);
    if (dir === 'left') {
      keysRef.current.ArrowLeft = true;
    } else {
      keysRef.current.ArrowRight = true;
    }
  };

  const handleTouchEnd = (dir: 'left' | 'right') => {
    setActiveTouch(null);
    if (dir === 'left') {
      keysRef.current.ArrowLeft = false;
    } else {
      keysRef.current.ArrowRight = false;
    }
  };

  // Direct canvas touch drag control
  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (status !== 'PLAYING') return;
    if (e.buttons === 1 || e.pointerType === 'touch') {
      const rect = e.currentTarget.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const margin = 28;
      const targetX = Math.max(margin, Math.min(rect.width - margin, clientX));
      
      const prevX = hamsterRef.current.x;
      if (targetX < prevX - 2) {
        hamsterRef.current.direction = -1;
      } else if (targetX > prevX + 2) {
        hamsterRef.current.direction = 1;
      }
      hamsterRef.current.x = targetX;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-[580px] max-w-[420px] select-none touch-none">
      <canvas
        ref={canvasRef}
        onPointerMove={handleCanvasPointerMove}
        className="block w-full h-full rounded-3xl cursor-grab active:cursor-grabbing"
      />

      {/* On-screen control buttons for mobile / easy touch */}
      <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-between px-6 pointer-events-auto">
        <button
          type="button"
          aria-label="왼쪽 이동"
          onMouseDown={() => handleTouchStart('left')}
          onMouseUp={() => handleTouchEnd('left')}
          onMouseLeave={() => handleTouchEnd('left')}
          onTouchStart={(e) => {
            e.preventDefault();
            handleTouchStart('left');
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleTouchEnd('left');
          }}
          className={`btn-ctrl w-20 h-14 rounded-2xl flex items-center justify-center text-white text-3xl font-black transition-transform ${
            activeTouch === 'left' ? 'scale-95 translate-y-1' : ''
          }`}
        >
          ◀
        </button>

        <button
          type="button"
          aria-label="오른쪽 이동"
          onMouseDown={() => handleTouchStart('right')}
          onMouseUp={() => handleTouchEnd('right')}
          onMouseLeave={() => handleTouchEnd('right')}
          onTouchStart={(e) => {
            e.preventDefault();
            handleTouchStart('right');
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleTouchEnd('right');
          }}
          className={`btn-ctrl w-20 h-14 rounded-2xl flex items-center justify-center text-white text-3xl font-black transition-transform ${
            activeTouch === 'right' ? 'scale-95 translate-y-1' : ''
          }`}
        >
          ▶
        </button>
      </div>
    </div>
  );
};
