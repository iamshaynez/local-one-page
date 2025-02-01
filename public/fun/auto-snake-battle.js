class Snake {
    constructor(color, startX, startY, initialDirection) {
        this.color = color;
        this.body = [{ x: startX, y: startY }];
        for (let i = 1; i < 3; i++) {
            this.body.push({
                x: startX - (initialDirection === 'right' ? i : initialDirection === 'left' ? -i : 0),
                y: startY - (initialDirection === 'down' ? i : initialDirection === 'up' ? -i : 0)
            });
        }
        this.direction = initialDirection;
        this.score = 0;
        this.alive = true;
    }

    move(food, otherSnake) {
        if (!this.alive) return;

        const head = { ...this.body[0] };
        const nextMove = this.findNextMove(food, otherSnake);
        
        switch (nextMove) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        this.direction = nextMove;
        this.body.unshift(head);

        if (!this.checkFood(food)) {
            this.body.pop();
        }

        this.checkCollision(otherSnake);
    }

    findNextMove(food, otherSnake) {
        const head = this.body[0];
        const possibleMoves = ['up', 'down', 'left', 'right'];
        let bestMove = this.direction;
        let minDistance = Infinity;

        for (const move of possibleMoves) {
            const nextPos = this.getNextPosition(move);
            
            if (this.wouldCollide(nextPos, otherSnake)) continue;

            const distance = Math.abs(nextPos.x - food.x) + Math.abs(nextPos.y - food.y);
            if (distance < minDistance) {
                minDistance = distance;
                bestMove = move;
            }
        }

        return bestMove;
    }

    getNextPosition(direction) {
        const head = { ...this.body[0] };
        switch (direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        return head;
    }

    wouldCollide(nextPos, otherSnake) {
        // Check wall collision
        if (nextPos.x < 0 || nextPos.x >= GRID_WIDTH || 
            nextPos.y < 0 || nextPos.y >= GRID_HEIGHT) {
            return true;
        }

        // Check self collision
        if (this.body.some(segment => segment.x === nextPos.x && segment.y === nextPos.y)) {
            return true;
        }

        // Check other snake collision
        if (otherSnake && otherSnake.body.some(segment => 
            segment.x === nextPos.x && segment.y === nextPos.y)) {
            return true;
        }

        return false;
    }

    checkFood(food) {
        if (this.body[0].x === food.x && this.body[0].y === food.y) {
            this.score++;
            return true;
        }
        return false;
    }

    checkCollision(otherSnake) {
        const head = this.body[0];

        // Check wall collision
        if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
            this.alive = false;
            return;
        }

        // Check self collision
        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                this.alive = false;
                return;
            }
        }

        // Check collision with other snake
        if (otherSnake) {
            for (const segment of otherSnake.body) {
                if (head.x === segment.x && head.y === segment.y) {
                    this.alive = false;
                    return;
                }
            }
        }
    }
}

const GRID_WIDTH = 30;
const GRID_HEIGHT = 20;
const CELL_SIZE = 20;
const GAME_SPEED = 100;

let canvas, ctx;
let snake1, snake2, food;
let gameLoop;
let isPaused = false;

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    document.getElementById('restartButton').addEventListener('click', startGame);
    document.getElementById('pauseButton').addEventListener('click', togglePause);

    startGame();
}

function startGame() {
    snake1 = new Snake('#4CAF50', 5, 10, 'right');
    snake2 = new Snake('#2196F3', 25, 10, 'left');
    generateFood();
    updateScores();

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, GAME_SPEED);
    isPaused = false;
    document.getElementById('pauseButton').textContent = 'Pause';
    document.getElementById('gameStatus').textContent = 'Game Running...';
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pauseButton').textContent = isPaused ? 'Resume' : 'Pause';
    document.getElementById('gameStatus').textContent = isPaused ? 'Game Paused' : 'Game Running...';
}

function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT)
        };
    } while (isPositionOccupied(food));
}

function isPositionOccupied(pos) {
    return snake1.body.some(segment => segment.x === pos.x && segment.y === pos.y) ||
           snake2.body.some(segment => segment.x === pos.x && segment.y === pos.y);
}

function update() {
    if (isPaused) return;

    snake1.move(food, snake2);
    snake2.move(food, snake1);

    if (snake1.checkFood(food) || snake2.checkFood(food)) {
        generateFood();
        updateScores();
    }

    if (!snake1.alive || !snake2.alive) {
        clearInterval(gameLoop);
        const status = !snake1.alive && !snake2.alive ? 'Draw!' :
                      !snake1.alive ? 'Snake 2 Wins!' : 'Snake 1 Wins!';
        document.getElementById('gameStatus').textContent = status;
    }

    draw();
}

function updateScores() {
    document.getElementById('score1').textContent = snake1.score;
    document.getElementById('score2').textContent = snake2.score;
    document.getElementById('length1').textContent = snake1.body.length;
    document.getElementById('length2').textContent = snake2.body.length;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= GRID_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL_SIZE, 0);
        ctx.lineTo(x * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
        ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL_SIZE);
        ctx.lineTo(GRID_WIDTH * CELL_SIZE, y * CELL_SIZE);
        ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE/2,
        food.y * CELL_SIZE + CELL_SIZE/2,
        CELL_SIZE/2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Draw snakes
    drawSnake(snake1);
    drawSnake(snake2);
}

function drawSnake(snake) {
    ctx.fillStyle = snake.color;
    snake.body.forEach((segment, index) => {
        if (index === 0) {
            // Draw head
            ctx.beginPath();
            ctx.arc(
                segment.x * CELL_SIZE + CELL_SIZE/2,
                segment.y * CELL_SIZE + CELL_SIZE/2,
                CELL_SIZE/2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        } else {
            // Draw body
            ctx.fillRect(
                segment.x * CELL_SIZE + 1,
                segment.y * CELL_SIZE + 1,
                CELL_SIZE - 2,
                CELL_SIZE - 2
            );
        }
    });
}

window.addEventListener('load', init);