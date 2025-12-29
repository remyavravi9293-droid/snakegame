document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // UI Elements
    const currentScoreEl = document.getElementById('current-score');
    const highScoreEl = document.getElementById('high-score');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const finalScoreEl = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');
    const pauseScreen = document.getElementById('pauseScreen');
    
    // Mobile Controls
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');

    // Game variables
    const gridSize = 20;
    let snake, apple, direction, score, highScore, gameSpeed, gameLoop, paused;

    // Scale canvas
    function scaleCanvas() {
        const containerWidth = canvas.parentElement.clientWidth;
        canvas.width = canvas.height = Math.floor(containerWidth / gridSize) * gridSize;
    }

    function init() {
        // Initial snake position and parts
        snake = [
            { x: gridSize * 10, y: gridSize * 10 },
            { x: gridSize * 9, y: gridSize * 10 },
            { x: gridSize * 8, y: gridSize * 10 }
        ];

        // Initial direction
        direction = { x: 1, y: 0 };
        
        // Score and speed
        score = 0;
        gameSpeed = 150; // Milliseconds per frame
        paused = false;

        // Load high score from localStorage
        highScore = localStorage.getItem('snakeHighScore') || 0;
        highScoreEl.textContent = highScore;
        currentScoreEl.textContent = 0;

        // Hide overlays
        gameOverScreen.style.display = 'none';
        pauseScreen.style.display = 'none';

        // Place the first apple
        placeApple();

        // Start the game loop
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(update, gameSpeed);
    }

    function update() {
        if (paused) return;

        // Move the snake
        const head = { x: snake[0].x + direction.x * gridSize, y: snake[0].y + direction.y * gridSize };
        snake.unshift(head);

        // Check for collisions
        if (isCollision(head)) {
            endGame();
            return;
        }

        // Check for apple consumption
        if (head.x === apple.x && head.y === apple.y) {
            score++;
            currentScoreEl.textContent = score;
            placeApple();

            // Increase speed every 5 apples
            if (score % 5 === 0 && gameSpeed > 50) {
                gameSpeed -= 10;
                clearInterval(gameLoop);
                gameLoop = setInterval(update, gameSpeed);
            }
        } else {
            snake.pop(); // Remove tail
        }

        draw();
    }
    
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#f9f9f9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw snake
        ctx.fillStyle = '#4CAF50';
        snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? '#388E3C' : '#4CAF50'; // Darker head
            ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
            ctx.strokeStyle = '#f9f9f9';
            ctx.strokeRect(segment.x, segment.y, gridSize, gridSize);
        });

        // Draw apple
        ctx.fillStyle = '#E74C3C';
        ctx.fillRect(apple.x, apple.y, gridSize, gridSize);
    }
    
    function placeApple() {
        let appleX, appleY;
        do {
            appleX = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
            appleY = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
        } while (isSnake(appleX, appleY));
        
        apple = { x: appleX, y: appleY };
    }
    
    function isSnake(x, y) {
        return snake.some(segment => segment.x === x && segment.y === y);
    }

    function isCollision(head) {
        // Wall collision
        if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
            return true;
        }
        // Self collision
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        return false;
    }

    function changeDirection(newDirection) {
        // Prevent reversing
        if (snake.length > 1 && newDirection.x === -direction.x && newDirection.y === -direction.y) {
            return;
        }
        direction = newDirection;
    }

    function togglePause() {
        paused = !paused;
        pauseScreen.style.display = paused ? 'flex' : 'none';
    }

    function endGame() {
        clearInterval(gameLoop);
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreEl.textContent = highScore;
        }
        finalScoreEl.textContent = score;
        gameOverScreen.style.display = 'flex';
    }
    
    // Event Listeners
    window.addEventListener('keydown', e => {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
                if (direction.y === 0) changeDirection({ x: 0, y: -1 });
                break;
            case 'ArrowDown':
            case 's':
                if (direction.y === 0) changeDirection({ x: 0, y: 1 });
                break;
            case 'ArrowLeft':
            case 'a':
                if (direction.x === 0) changeDirection({ x: -1, y: 0 });
                break;
            case 'ArrowRight':
            case 'd':
                if (direction.x === 0) changeDirection({ x: 1, y: 0 });
                break;
            case ' ': // Spacebar
                togglePause();
                break;
            case 'r':
            case 'R':
                init();
                break;
        }
    });

    restartButton.addEventListener('click', init);
    
    // Mobile controls listeners
    upBtn.addEventListener('click', () => { if (direction.y === 0) changeDirection({ x: 0, y: -1 }); });
    downBtn.addEventListener('click', () => { if (direction.y === 0) changeDirection({ x: 0, y: 1 }); });
    leftBtn.addEventListener('click', () => { if (direction.x === 0) changeDirection({ x: -1, y: 0 }); });
    rightBtn.addEventListener('click', () => { if (direction.x === 0) changeDirection({ x: 1, y: 0 }); });

    window.addEventListener('resize', scaleCanvas);

    // Initial setup
    scaleCanvas();
    init();
});