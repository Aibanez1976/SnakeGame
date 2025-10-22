// Snake Game - Apple Style
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.restartButton = document.getElementById('restartButton');
        
        // Game state
        this.gameRunning = false;
        this.score = 0;
        this.level = 1;
        this.speed = 1;
        this.gameSpeed = 150; // Initial delay in ms
        
        // Grid dimensions (50x40 as specified)
        this.gridWidth = 40;
        this.gridHeight = 50;
        this.cellSize = 0;
        
        // Snake properties
        this.snake = [];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        // Apple properties
        this.apple = { x: 0, y: 0 };
        
        // Colors for cycling
        this.snakeColors = ['#34C759', '#007AFF', '#FF3B30', '#1d1d1f', '#FF2D92', '#FFCC00'];
        this.backgroundColors = ['#ffffff', '#f5f5f7', '#e3f2fd'];
        this.currentSnakeColor = 0;
        this.currentBackgroundColor = 0;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.startGame();
    }
    
    setupCanvas() {
        // Make canvas responsive while maintaining aspect ratio
        const container = this.canvas.parentElement;
        const maxWidth = Math.min(window.innerWidth - 40, 800);
        const maxHeight = Math.min(window.innerHeight - 200, 600);
        
        // Calculate cell size to fit grid in available space
        const cellWidth = maxWidth / this.gridWidth;
        const cellHeight = maxHeight / this.gridHeight;
        this.cellSize = Math.min(cellWidth, cellHeight);
        
        this.canvas.width = this.gridWidth * this.cellSize;
        this.canvas.height = this.gridHeight * this.cellSize;
        
        // Center canvas
        this.canvas.style.width = this.canvas.width + 'px';
        this.canvas.style.height = this.canvas.height + 'px';
    }
    
    setupEventListeners() {
        // Arrow key controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: -1 };
                    }
                    break;
                case 'ArrowDown':
                    if (this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: 1 };
                    }
                    break;
                case 'ArrowLeft':
                    if (this.direction.x === 0) {
                        this.nextDirection = { x: -1, y: 0 };
                    }
                    break;
                case 'ArrowRight':
                    if (this.direction.x === 0) {
                        this.nextDirection = { x: 1, y: 0 };
                    }
                    break;
            }
            e.preventDefault();
        });
        
        // Restart button
        this.restartButton.addEventListener('click', () => {
            this.hideGameOver();
            this.startGame();
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.level = 1;
        this.speed = 1;
        this.gameSpeed = 150;
        
        // Initialize snake in center
        const centerX = Math.floor(this.gridWidth / 2);
        const centerY = Math.floor(this.gridHeight / 2);
        this.snake = [
            { x: centerX, y: centerY },
            { x: centerX - 1, y: centerY },
            { x: centerX - 2, y: centerY }
        ];
        
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        this.generateApple();
        this.updateHUD();
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        
        setTimeout(() => {
            this.gameLoop();
        }, this.gameSpeed);
    }
    
    update() {
        // Update direction
        this.direction = { ...this.nextDirection };
        
        // Move snake
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.gridWidth || 
            head.y < 0 || head.y >= this.gridHeight) {
            this.gameOver();
            return;
        }
        
        // Check self collision
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // Check apple collision
        if (head.x === this.apple.x && head.y === this.apple.y) {
            this.score++;
            this.generateApple();
            this.updateHUD();
            
            // Level up every apple
            this.levelUp();
        } else {
            this.snake.pop();
        }
    }
    
    levelUp() {
        this.level++;
        this.speed = Math.round(this.level * 1.1);
        
        // Increase speed by 10% (decrease delay)
        this.gameSpeed = Math.max(50, this.gameSpeed * 0.9);
        
        // Change colors
        this.currentSnakeColor = (this.currentSnakeColor + 1) % this.snakeColors.length;
        this.currentBackgroundColor = (this.currentBackgroundColor + 1) % this.backgroundColors.length;
        
        this.updateHUD();
    }
    
    generateApple() {
        let newApple;
        do {
            newApple = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            };
        } while (this.snake.some(segment => 
            segment.x === newApple.x && segment.y === newApple.y
        ));
        
        this.apple = newApple;
    }
    
    draw() {
        // Clear canvas with current background color
        this.ctx.fillStyle = this.backgroundColors[this.currentBackgroundColor];
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw snake with rounded joints
        this.drawSnake();
        
        // Draw apple
        this.drawApple();
    }
    
    drawSnake() {
        const color = this.snakeColors[this.currentSnakeColor];
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = this.cellSize * 0.8;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Draw snake as connected line segments
        this.ctx.beginPath();
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const x = segment.x * this.cellSize + this.cellSize / 2;
            const y = segment.y * this.cellSize + this.cellSize / 2;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();
        
        // Draw head with a circle
        const head = this.snake[0];
        const headX = head.x * this.cellSize + this.cellSize / 2;
        const headY = head.y * this.cellSize + this.cellSize / 2;
        
        this.ctx.beginPath();
        this.ctx.arc(headX, headY, this.cellSize * 0.3, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    drawApple() {
        const x = this.apple.x * this.cellSize + this.cellSize / 2;
        const y = this.apple.y * this.cellSize + this.cellSize / 2;
        const size = this.cellSize * 0.4;
        
        // Draw apple body (red)
        this.ctx.fillStyle = '#FF3B30';
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Draw apple stem (green)
        this.ctx.fillStyle = '#34C759';
        this.ctx.fillRect(x - size * 0.1, y - size * 0.8, size * 0.2, size * 0.3);
        
        // Draw apple leaf (green)
        this.ctx.beginPath();
        this.ctx.ellipse(x + size * 0.2, y - size * 0.6, size * 0.15, size * 0.1, Math.PI / 4, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('speed').textContent = this.speed + 'x';
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        this.showGameOver();
    }
    
    showGameOver() {
        this.gameOverOverlay.classList.add('show');
    }
    
    hideGameOver() {
        this.gameOverOverlay.classList.remove('show');
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
