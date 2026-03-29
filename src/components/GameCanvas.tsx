import React, { useEffect, useRef, useState } from 'react';
import { Player, Obstacle } from '../types';

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  isStarted: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver, isStarted }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  const [score, setScore] = useState(0);

  // Game constants
  const GRAVITY = 0.5;
  const JUMP_FORCE = -14;
  const GROUND_HEIGHT = 60;
  const PLAYER_WIDTH = 50;
  const PLAYER_HEIGHT = 50;
  const OBSTACLE_MIN_GAP = 250;
  const INITIAL_SPEED = 3.5; // Slower starting speed
  const SPEED_STEP = 0.5; // Speed increase every 100 points
  const HEIGHT_STEP = 10; // Height increase every 100 points starting at 200

  // Background buildings state
  const buildingsRef = useRef<{ x: number, width: number, height: number, color: string }[]>([]);
  const slothImgRef = useRef<HTMLImageElement | null>(null);

  // Game state refs (to avoid closure issues in game loop)
  const playerRef = useRef<Player>({
    x: 80,
    y: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    vy: 0,
    isJumping: false,
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const speedRef = useRef(INITIAL_SPEED);
  const scoreRef = useRef(0);
  const frameCountRef = useRef(0);
  const isGameOverRef = useRef(false);

  useEffect(() => {
    const img = new Image();
    img.src = 'https://img.icons8.com/fluency/96/sloth.png';
    img.onload = () => {
      slothImgRef.current = img;
    };
  }, []);

  const resetGame = () => {
    playerRef.current = {
      x: 80,
      y: 0,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      vy: 0,
      isJumping: false,
    };
    obstaclesRef.current = [];
    speedRef.current = INITIAL_SPEED;
    scoreRef.current = 0;
    setScore(0);
    frameCountRef.current = 0;
    isGameOverRef.current = false;

    // Initialize buildings
    buildingsRef.current = Array.from({ length: 10 }, (_, i) => ({
      x: i * 150,
      width: 80 + Math.random() * 100,
      height: 100 + Math.random() * 200,
      color: `rgba(30, 41, 59, ${0.3 + Math.random() * 0.4})`
    }));
  };

  const handleJump = () => {
    if (!playerRef.current.isJumping && !isGameOverRef.current) {
      playerRef.current.vy = JUMP_FORCE;
      playerRef.current.isJumping = true;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        handleJump();
      }
    };

    const handleTouch = () => {
      handleJump();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouch);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouch);
    };
  }, []);

  const update = (canvas: HTMLCanvasElement) => {
    if (!isStarted || isGameOverRef.current) return;

    const player = playerRef.current;
    const obstacles = obstaclesRef.current;
    const buildings = buildingsRef.current;

    const currentScore = Math.floor(scoreRef.current);

    // Update speed based on score (every 100 points)
    speedRef.current = INITIAL_SPEED + Math.floor(currentScore / 100) * SPEED_STEP;

    // Update buildings (parallax)
    buildings.forEach(b => {
      b.x -= speedRef.current * 0.3;
      if (b.x + b.width < 0) {
        b.x = canvas.width + Math.random() * 50;
        b.height = 100 + Math.random() * 200;
      }
    });

    // Update player
    player.vy += GRAVITY;
    player.y += player.vy;

    const groundY = canvas.height - GROUND_HEIGHT - player.height;
    if (player.y > groundY) {
      player.y = groundY;
      player.vy = 0;
      player.isJumping = false;
    }

    // Spawn obstacles
    if (frameCountRef.current % 100 === 0 || (obstacles.length === 0)) {
        const lastObstacle = obstacles[obstacles.length - 1];
        if (!lastObstacle || (canvas.width - lastObstacle.x > OBSTACLE_MIN_GAP + Math.random() * 300)) {
            const isFlying = currentScore >= 300 && Math.random() > 0.5;
            
            // Calculate height based on score (starts growing at 200)
            let obsHeight = 30;
            if (currentScore >= 200) {
                obsHeight = 30 + Math.floor((currentScore - 100) / 100) * HEIGHT_STEP;
            }

            const type = isFlying ? 'flying' : 'ground';
            const y = isFlying 
                ? canvas.height - GROUND_HEIGHT - 120 - Math.random() * 40 // Bird height
                : canvas.height - GROUND_HEIGHT - obsHeight;

            obstacles.push({
                x: canvas.width,
                y: y,
                width: isFlying ? 45 : 40,
                height: isFlying ? 30 : obsHeight,
                speed: speedRef.current,
                type: type
            });
        }
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].x -= speedRef.current;

      // Collision detection
      const hitBoxPadding = 12;
      if (
        player.x + hitBoxPadding < obstacles[i].x + obstacles[i].width - hitBoxPadding &&
        player.x + player.width - hitBoxPadding > obstacles[i].x + hitBoxPadding &&
        player.y + hitBoxPadding < obstacles[i].y + obstacles[i].height - hitBoxPadding &&
        player.y + player.height - hitBoxPadding > obstacles[i].y
      ) {
        isGameOverRef.current = true;
        onGameOver(currentScore);
        return;
      }

      // Remove off-screen obstacles
      if (obstacles[i].x + obstacles[i].width < 0) {
        obstacles.splice(i, 1);
      }
    }

    scoreRef.current += 0.15;
    setScore(currentScore);
    frameCountRef.current++;
  };

  const drawSloth = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    if (slothImgRef.current) {
      ctx.drawImage(slothImgRef.current, x, y, w, h);
      return;
    }
    
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    
    // Body
    ctx.fillStyle = '#8B4513'; // Brown
    ctx.beginPath();
    ctx.ellipse(0, 5, w / 2.2, h / 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Face patch
    ctx.fillStyle = '#DEB887'; // BurlyWood
    ctx.beginPath();
    ctx.ellipse(0, -5, w / 3, h / 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#3E2723';
    ctx.beginPath();
    ctx.arc(-w / 6, -6, 3, 0, Math.PI * 2);
    ctx.arc(w / 6, -6, 3, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.quadraticCurveTo(-w / 1.5, -h / 2, -w / 3, -h / 1.5);
    ctx.moveTo(w / 2, 0);
    ctx.quadraticCurveTo(w / 1.5, -h / 2, w / 3, -h / 1.5);
    ctx.stroke();

    ctx.restore();
  };

  const drawThorns = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = '#ef4444'; // Red spikes
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ef4444';
    
    ctx.beginPath();
    const numSpikes = 3;
    const spikeW = w / numSpikes;
    for (let i = 0; i < numSpikes; i++) {
        const startX = x + i * spikeW;
        ctx.moveTo(startX, y + h);
        ctx.lineTo(startX + spikeW / 2, y);
        ctx.lineTo(startX + spikeW, y + h);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const drawBird = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    
    // Wing animation
    const wingY = Math.sin(Date.now() / 100) * 10;

    ctx.fillStyle = '#fde047'; // Yellow bird
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fde047';

    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, w / 2, h / 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.beginPath();
    ctx.moveTo(-w / 4, 0);
    ctx.lineTo(-w / 2, wingY);
    ctx.lineTo(-w / 4, 5);
    ctx.moveTo(w / 4, 0);
    ctx.lineTo(w / 2, wingY);
    ctx.lineTo(w / 4, 5);
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(w / 4, -2, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#020617');
    bgGradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw buildings (parallax)
    buildingsRef.current.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, canvas.height - GROUND_HEIGHT - b.height, b.width, b.height);
      // Windows
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let j = 0; j < b.height / 20; j++) {
        for (let k = 0; k < b.width / 20; k++) {
            if (Math.random() > 0.3) {
                ctx.fillRect(b.x + 5 + k * 15, canvas.height - GROUND_HEIGHT - b.height + 10 + j * 15, 8, 8);
            }
        }
      }
    });

    // Draw ground
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - GROUND_HEIGHT);
    ctx.lineTo(canvas.width, canvas.height - GROUND_HEIGHT);
    ctx.stroke();

    // Draw player (Sloth)
    const player = playerRef.current;
    drawSloth(ctx, player.x, player.y, player.width, player.height);

    // Draw obstacles
    obstaclesRef.current.forEach((obs) => {
      if (obs.type === 'flying') {
        drawBird(ctx, obs.x, obs.y, obs.width, obs.height);
      } else {
        drawThorns(ctx, obs.x, obs.y, obs.width, obs.height);
      }
    });
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (canvas && ctx) {
      update(canvas);
      draw(ctx, canvas);
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    if (isStarted) {
      resetGame();
      requestRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isStarted]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-slate-950">
      <div className="absolute top-4 left-4 z-10">
        <p className="text-pink-400 font-mono text-2xl font-bold">SCORE: {score}</p>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full max-w-3xl aspect-[2/1] border-2 border-slate-800 rounded-lg shadow-2xl shadow-pink-500/20"
      />
      <div className="mt-4 text-slate-400 text-sm font-mono animate-pulse">
        PRESS SPACE OR TAP TO JUMP
      </div>
    </div>
  );
};

export default GameCanvas;
