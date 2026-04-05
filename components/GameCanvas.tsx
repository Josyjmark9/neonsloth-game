import React, { useRef, useEffect, useState } from 'react';
import { Player, Obstacle } from '../types';
import { soundManager } from '../lib/sound';

interface GameCanvasProps {
  isStarted: boolean;
  onGameOver: (score: number) => void;
  difficultyMultiplier?: number;
}

export default function GameCanvas({ isStarted, onGameOver, difficultyMultiplier = 1 }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const requestRef = useRef<number | null>(null);
  
  const gameState = useRef({
    player: { x: 50, y: 200, width: 50, height: 50, vy: 0, isJumping: false } as Player,
    obstacles: [] as Obstacle[],
    score: 0,
    frameCount: 0,
    isGameOver: false,
    speed: 9,
    groundY: 0,
    cityOffset: 0,
    buildings: [] as { x: number, width: number, height: number, color: string }[]
  });

  const resetGame = (width: number, height: number) => {
    const groundY = height - 60;
    const scale = height / 600; // Base height for scaling
    const playerSize = Math.max(30, Math.min(50, 50 * scale));
    
    // Generate initial buildings
    const buildings = [];
    let currentX = 0;
    while (currentX < width + 400) {
      const bWidth = 60 + Math.random() * 100;
      const bHeight = (100 + Math.random() * 200) * scale;
      buildings.push({
        x: currentX,
        width: bWidth,
        height: bHeight,
        color: `rgba(${20 + Math.random() * 20}, ${20 + Math.random() * 20}, ${40 + Math.random() * 40}, 0.5)`
      });
      currentX += bWidth + 20;
    }

    gameState.current = {
      player: { 
        x: 80, 
        y: groundY - playerSize, 
        width: playerSize, 
        height: playerSize, 
        vy: 0, 
        isJumping: false 
      },
      obstacles: [],
      score: 0,
      frameCount: 0,
      isGameOver: false,
      speed: 9,
      groundY,
      cityOffset: 0,
      buildings
    };
    setScore(0);
  };

  const jump = () => {
    if (!gameState.current.player.isJumping && !gameState.current.isGameOver && isStarted) {
      soundManager.playSFX('jump');
      const scale = (canvasRef.current?.height || 600) / 600;
      gameState.current.player.vy = -15 * scale;
      gameState.current.player.isJumping = true;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
        if (isStarted) {
          resetGame(canvas.width, canvas.height);
        }
      }
    };

    resize();
    window.addEventListener('resize', resize);

    if (!isStarted) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      // Still draw the initial state or a static frame
      draw();
      return;
    }

    const update = () => {
      if (gameState.current.isGameOver) return;

      const { player, obstacles, speed, groundY } = gameState.current;

      // Player Physics
      const scale = canvas.height / 600;
      player.vy += 0.8 * scale; // Gravity scaled
      player.y += player.vy;

      if (player.y > groundY - player.height) {
        player.y = groundY - player.height;
        player.vy = 0;
        player.isJumping = false;
      }

      // Obstacle Spawning
      // Decreasing spawn interval as score increases
      // Base interval: 60 frames. Decreases by 5 every 10 points, min 30.
      const spawnInterval = Math.max(30, 60 - Math.floor(gameState.current.score / 10) * 5);
      
      gameState.current.frameCount++;
      if (gameState.current.frameCount % spawnInterval === 0) {
        const type = Math.random() > 0.6 ? 'flying' : 'ground';
        const h = (40 + Math.random() * 40) * scale;
        const y = type === 'ground' ? groundY - h : groundY - (140 * scale) - Math.random() * (60 * scale);
        obstacles.push({
          x: canvas.width,
          y,
          width: 40 * scale,
          height: h,
          speed: gameState.current.speed,
          type
        });
      }

      // Update Background City
      gameState.current.cityOffset += gameState.current.speed * 0.3;
      gameState.current.buildings.forEach(b => {
        b.x -= gameState.current.speed * 0.3;
      });

      // Recycle buildings
      if (gameState.current.buildings.length > 0 && gameState.current.buildings[0].x + gameState.current.buildings[0].width < 0) {
        const lastB = gameState.current.buildings[gameState.current.buildings.length - 1];
        const bWidth = 60 + Math.random() * 100;
        const bHeight = 100 + Math.random() * 200;
        gameState.current.buildings.shift();
        gameState.current.buildings.push({
          x: lastB.x + lastB.width + 20,
          width: bWidth,
          height: bHeight,
          color: `rgba(${20 + Math.random() * 20}, ${20 + Math.random() * 20}, ${40 + Math.random() * 40}, 0.5)`
        });
      }

      // Update Obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        
        // Dynamic Speed Calculation based on score and difficultyMultiplier
        // Base increase: 3 every 5 points. Multiplied by difficultyMultiplier.
        const speedStep = 3 * difficultyMultiplier;
        const currentSpeed = 9 + Math.floor(gameState.current.score / 5) * speedStep;
        obs.x -= currentSpeed;
        gameState.current.speed = currentSpeed;

        // Collision Detection
        if (
          player.x < obs.x + obs.width &&
          player.x + player.width > obs.x &&
          player.y < obs.y + obs.height &&
          player.y + player.height > obs.y
        ) {
          if (!gameState.current.isGameOver) {
            gameState.current.isGameOver = true;
            onGameOver(Math.floor(gameState.current.score));
          }
          return;
        }

        // Score and Cleanup
        if (obs.x + obs.width < 0) {
          obstacles.splice(i, 1);
          gameState.current.score += 1;
          setScore(Math.floor(gameState.current.score));
          // Play score sound every 5 points
          if (Math.floor(gameState.current.score) % 5 === 0) {
            soundManager.playSFX('score');
          }
        }
      }

      draw();
      requestRef.current = requestAnimationFrame(update);
    };

    function draw() {
      if (!ctx || !canvas) return;
      const { player, obstacles, groundY, score, buildings } = gameState.current;

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background City (Parallax)
      buildings.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, canvas.height - b.height - 60, b.width, b.height);
        
        // Windows
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let wx = b.x + 10; wx < b.x + b.width - 10; wx += 20) {
          for (let wy = canvas.height - b.height - 50; wy < canvas.height - 70; wy += 30) {
            if (Math.random() > 0.3) {
              ctx.fillRect(wx, wy, 10, 15);
            }
          }
        }
      });

      // Background Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Ground
      const currentGroundY = groundY || canvas.height - 60;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, currentGroundY, canvas.width, canvas.height - currentGroundY);
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, currentGroundY);
      ctx.lineTo(canvas.width, currentGroundY);
      ctx.stroke();

      // Player (Sloth Character)
      ctx.save();
      ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
      
      // Rotation based on velocity
      const rotation = Math.max(-0.3, Math.min(0.3, player.vy * 0.02));
      ctx.rotate(rotation);

      // Body
      ctx.fillStyle = '#94a3b8'; // Sloth Grey-Blue
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ec4899';
      
      // Main Body
      ctx.beginPath();
      ctx.ellipse(0, 0, player.width / 2, player.height / 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Face Patch
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.ellipse(5, -2, player.width / 3, player.height / 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eye Patches
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.ellipse(12, -4, 8, 5, 0.2, 0, Math.PI * 2);
      ctx.ellipse(0, -4, 8, 5, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(14, -4, 2, 0, Math.PI * 2);
      ctx.arc(2, -4, 2, 0, Math.PI * 2);
      ctx.fill();

      // Nose
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(8, 2, 3, 0, Math.PI * 2);
      ctx.fill();

      // Arms (Clinging pose)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-15, 5);
      ctx.quadraticCurveTo(-25, 15, -15, 25);
      ctx.stroke();
      
      ctx.restore();
      ctx.shadowBlur = 0;

      // Obstacles (Thorns and Birds)
      ctx.shadowBlur = 10;
      
      const sizeBonus = Math.floor(score / 10) * 5;
      const maxBonus = 40;
      const finalSizeBonus = Math.min(sizeBonus, maxBonus);

      obstacles.forEach(obs => {
        if (obs.type === 'ground') {
          ctx.fillStyle = '#06b6d4';
          ctx.shadowColor = '#06b6d4';
          const displayHeight = obs.height + finalSizeBonus;
          const displayY = currentGroundY - displayHeight;
          ctx.beginPath();
          ctx.moveTo(obs.x, currentGroundY);
          ctx.lineTo(obs.x + obs.width / 2, displayY);
          ctx.lineTo(obs.x + obs.width, currentGroundY);
          ctx.fill();
        } else {
          // Bird Obstacle
          ctx.fillStyle = '#f43f5e'; // Red Bird
          ctx.shadowColor = '#f43f5e';
          
          // Body
          ctx.beginPath();
          ctx.ellipse(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, obs.height / 3, 0, 0, Math.PI * 2);
          ctx.fill();

          // Wings (Flapping animation)
          const flap = Math.sin(Date.now() * 0.01) * 15;
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.width / 2, obs.y + obs.height / 2);
          ctx.lineTo(obs.x + obs.width / 2 - 10, obs.y + obs.height / 2 - 20 + flap);
          ctx.lineTo(obs.x + obs.width / 2 - 20, obs.y + obs.height / 2);
          ctx.fill();

          // Beak
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.height / 2);
          ctx.lineTo(obs.x - 10, obs.y + obs.height / 2);
          ctx.lineTo(obs.x, obs.y + obs.height / 2 + 5);
          ctx.fill();
        }
      });
      ctx.shadowBlur = 0;
    }

    requestRef.current = requestAnimationFrame(update);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isStarted, onGameOver]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden relative cursor-pointer"
      onClick={jump}
    >
      <canvas 
        ref={canvasRef}
        className="block"
      />
      
      {isStarted && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="text-6xl font-black text-white italic tracking-tighter drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
            {score}
          </div>
        </div>
      )}

      {!isStarted && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="text-6xl font-black text-pink-500 animate-pulse italic tracking-tighter">NEON SLOTH</div>
            <p className="text-slate-400 font-mono uppercase tracking-widest text-sm">Tap or Space to Jump</p>
          </div>
        </div>
      )}
    </div>
  );
}
