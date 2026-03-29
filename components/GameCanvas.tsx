import React from 'react';

interface GameCanvasProps {
    isStarted: boolean;
    onGameOver: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ isStarted, onGameOver }) => {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if (context) {
            // Game initialization and rendering logic here
            const gameLoop = () => {
                if (isStarted) {
                    // Update game state and render
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    // Draw game elements
                    // If game over condition met:
                    // onGameOver();
                }
                requestAnimationFrame(gameLoop);
            };
            gameLoop();
        }

        return () => {
            // Cleanup if necessary
        };
    }, [isStarted, onGameOver]);

    return <canvas ref={canvasRef} width={800} height={600} />;
};

export default GameCanvas;
