const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const groundHeight = canvasHeight - 50;

// Game elements
let monsters = [];
let score = 0;
let lives = 3;
let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let currentLetterIndex = 0;
let isGameOver = false;

// Player settings
const player = {
    x: 50,
    y: groundHeight,
    width: 30,
    height: 50,
    color: 'blue',
    speed: 5,
    dx: 0,
    dy: 0,
    isJumping: false,
    gravity: 0.5,
    jumpStrength: -10,
};

// Monster settings
class Monster {
    constructor(letter) {
        this.letter = letter;
        this.x = canvasWidth - 50;
        this.y = groundHeight - 20;
        this.width = 30;
        this.height = 30;
        this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
        this.speed = 2;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.letter, this.x, this.y);
    }

    update() {
        this.x -= this.speed; // Move left
    }
}

// Spawn a new monster with the next letter
function spawnMonster() {
    if (currentLetterIndex < alphabet.length) {
        const letter = alphabet[currentLetterIndex];
        const monster = new Monster(letter);
        monsters.push(monster);
    }
}

// Initial spawn to ensure visibility
spawnMonster();

// Draw background
function drawBackground() {
    ctx.fillStyle = '#87CEEB';  // Sky color
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Ground
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, groundHeight, canvasWidth, canvasHeight - groundHeight);
}

// Draw player
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y - player.height, player.width, player.height);
}

// Display HUD
function displayHUD() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Lives: ${lives}`, canvasWidth / 2 - 50, 30);
    ctx.fillText(`Score: ${score}`, canvasWidth / 2 + 50, 30);
}

// Game loop
function gameLoop() {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    displayHUD();

    // Draw and update monsters
    monsters.forEach((monster, index) => {
        monster.update();
        monster.draw();

        // Check if player collides with monster from the top to defeat it
        if (checkTopCollision(monster)) {
            monsters.splice(index, 1);  // Remove monster
            score += 1;  // Increase score for defeating a monster
            console.log(`Score updated: ${score}`);
            currentLetterIndex++;  // Move to the next letter
            spawnMonster();  // Spawn next monster
        } 
        // Check if player collides from the side
        else if (checkSideCollision(monster)) {
            monsters.splice(index, 1);  // Remove monster
            lives -= 1;  // Decrease lives on side collision
            console.log(`Lives updated: ${lives}`);
            currentLetterIndex++;  // Move to the next letter
            spawnMonster();  // Spawn next monster

            // Check for game over
            if (lives <= 0) {
                gameOver();
            }
        }

        // Remove monster if it goes off-screen
        if (monster.x < -monster.width) {
            monsters.splice(index, 1);
            currentLetterIndex++;  // Move to the next letter
            spawnMonster();  // Spawn the next monster
        }
    });

    drawPlayer();
    updatePlayerPosition();
    requestAnimationFrame(gameLoop);
}

// Check if player lands on top of the monster
function checkTopCollision(monster) {
    return (
        player.y + player.height <= monster.y &&  // Player's feet above monster's top
        player.y + player.height + player.dy >= monster.y &&  // Falling
        player.x + player.width > monster.x &&  // Player's right touches monster's left
        player.x < monster.x + monster.width    // Player's left touches monster's right
    );
}

// Check for side collision
function checkSideCollision(monster) {
    return (
        player.x + player.width > monster.x &&
        player.x < monster.x + monster.width &&
        player.y + player.height > monster.y &&
        player.y < monster.y + monster.height
    );
}

// Player movement and gravity
function updatePlayerPosition() {
    player.x += player.dx;

    if (player.isJumping) {
        player.dy += player.gravity;
        player.y += player.dy;
        if (player.y > groundHeight) {
            player.y = groundHeight;
            player.isJumping = false;
        }
    }
}

// Game Over
function gameOver() {
    isGameOver = true;
    alert(`Game Over! Final score: ${score}`);
    window.location.reload();
}

// Controls
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') player.dx = -player.speed;
    if (e.key === 'ArrowRight') player.dx = player.speed;
    if (e.key === 'ArrowUp' && !player.isJumping) {
        player.dy = player.jumpStrength;
        player.isJumping = true;
    }
});
window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.dx = 0;
});

// Start game loop
gameLoop();
