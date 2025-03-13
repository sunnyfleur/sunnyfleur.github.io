/**
 * Game Runner Portfolio - Một mini game để hiển thị kỹ năng và thành tựu
 */

// Cấu hình game
const config = {
    gravity: 0.6,
    jumpForce: -13,
    superJumpForce: -18,
    groundHeight: 60,
    playerWidth: 40,
    playerHeight: 50,
    gameSpeed: 5,
    scoreIncrement: 0.1,
    doubleClickTime: 300 // ms
};

// Các kỹ năng và mô tả
const skills = [
    {
        name: 'Unity',
        description: 'Phát triển game với Unity Engine, tập trung vào gameplay và tối ưu hóa hiệu suất.',
        color: '#00CCFF'
    },
    {
        name: 'Game Design',
        description: 'Thiết kế cân bằng gameplay, kinh tế game và hệ thống tiến trình người chơi.',
        color: '#FF6600'
    },
    {
        name: 'Pixel Art',
        description: 'Sáng tạo đồ họa pixel art cho nhân vật, môi trường và animation.',
        color: '#FF33CC'
    },
    {
        name: 'JavaScript',
        description: 'Phát triển ứng dụng web tương tác và mini game trên nền tảng trình duyệt.',
        color: '#FFCC00'
    },
    {
        name: 'Photoshop',
        description: 'Thiết kế hình ảnh, chỉnh sửa concept art và UI/UX cho các dự án game.',
        color: '#33CCFF'
    }
];

// Chướng ngại vật
const obstacles = [
    {
        name: 'Bug',
        width: 40,
        height: 40,
        color: '#FF3333'
    },
    {
        name: 'Deadline',
        width: 60,
        height: 30,
        color: '#FF0000'
    },
    {
        name: 'Creative Block',
        width: 50,
        height: 50,
        color: '#663399'
    }
];

// Định nghĩa biến
let canvas, ctx;
let player, score;
let gameObjects = [];
let isJumping = false;
let isGameOver = false;
let isGameRunning = false;
let lastClickTime = 0;
let skillPopupTimer = null;
let animationFrameId = null;

// Lớp đối tượng game cơ bản
class GameObject {
    constructor(x, y, width, height, speed, type, color, name) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.type = type;
        this.color = color;
        this.name = name;
    }

    update() {
        this.x -= this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Vẽ text cho các chướng ngại vật
        if (this.type === 'obstacle') {
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(this.name, this.x + this.width/2 - ctx.measureText(this.name).width/2, this.y + this.height/2 + 4);
        }
    }

    isColliding(other) {
        return !(
            this.x + this.width < other.x ||
            this.x > other.x + other.width ||
            this.y + this.height < other.y ||
            this.y > other.y + other.height
        );
    }
}

// Lớp người chơi
class Player extends GameObject {
    constructor(x, y) {
        super(x, y, config.playerWidth, config.playerHeight, 0, 'player', '#F5A905', 'Player');
        this.velocityY = 0;
        this.isGrounded = true;
        this.frameCount = 0;
        this.legPosition = 0;
    }

    update() {
        // Xử lý trọng lực
        if (!this.isGrounded) {
            this.velocityY += config.gravity;
            this.y += this.velocityY;
        }

        // Kiểm tra khi chạm đất
        const groundY = canvas.height - config.groundHeight - this.height;
        if (this.y >= groundY) {
            this.y = groundY;
            this.isGrounded = true;
            this.velocityY = 0;
        }

        // Cập nhật animation
        this.frameCount++;
        if (this.frameCount % 6 === 0) {
            this.legPosition = (this.legPosition + 1) % 4;
        }
    }

    jump(superJump = false) {
        if (this.isGrounded) {
            this.velocityY = superJump ? config.superJumpForce : config.jumpForce;
            this.isGrounded = false;
        }
    }

    draw(ctx) {
        // Vẽ người chơi theo phong cách pixel art
        ctx.fillStyle = this.color;
        
        // Vẽ thân
        ctx.fillRect(this.x + 10, this.y + 10, this.width - 20, this.height - 20);
        
        // Vẽ đầu
        ctx.fillRect(this.x + 15, this.y, this.width - 30, 15);
        
        // Vẽ mắt
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 25, this.y + 5, 5, 5);
        
        // Vẽ chân - Animation chạy khi ở trên mặt đất
        if (this.isGrounded) {
            if (this.legPosition === 0) {
                ctx.fillRect(this.x + 15, this.y + this.height - 10, 8, 10); // Chân trái
                ctx.fillRect(this.x + this.width - 23, this.y + this.height - 15, 8, 15); // Chân phải
            } else if (this.legPosition === 1) {
                ctx.fillRect(this.x + 15, this.y + this.height - 15, 8, 15); // Chân trái
                ctx.fillRect(this.x + this.width - 23, this.y + this.height - 10, 8, 10); // Chân phải
            } else if (this.legPosition === 2) {
                ctx.fillRect(this.x + 15, this.y + this.height - 13, 8, 13); // Chân trái
                ctx.fillRect(this.x + this.width - 23, this.y + this.height - 13, 8, 13); // Chân phải
            } else {
                ctx.fillRect(this.x + 15, this.y + this.height - 10, 8, 10); // Chân trái
                ctx.fillRect(this.x + this.width - 23, this.y + this.height - 10, 8, 10); // Chân phải
            }
        } else {
            // Vẽ chân khi nhảy
            ctx.fillRect(this.x + 15, this.y + this.height - 13, 8, 13); // Chân trái
            ctx.fillRect(this.x + this.width - 23, this.y + this.height - 13, 8, 13); // Chân phải
        }
    }
}

// Lớp hình ảnh kỹ năng
class SkillIcon extends GameObject {
    constructor(x, y, skill) {
        super(x, y, 30, 30, config.gameSpeed, 'skill', skill.color, skill.name);
        this.description = skill.description;
    }

    draw(ctx) {
        // Vẽ biểu tượng kỹ năng
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Vẽ text cho biểu tượng
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        const textWidth = ctx.measureText(this.name.charAt(0)).width;
        ctx.fillText(this.name.charAt(0), this.x + this.width / 2 - textWidth / 2, this.y + this.height / 2 + 4);
    }
}

// Lớp chướng ngại vật
class Obstacle extends GameObject {
    constructor(x, y, obstacle) {
        super(x, y, obstacle.width, obstacle.height, config.gameSpeed, 'obstacle', obstacle.color, obstacle.name);
    }
}

// Khởi tạo game
function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // Khởi tạo người chơi
    player = new Player(100, canvas.height - config.groundHeight - config.playerHeight);
    
    // Khởi tạo điểm
    score = 0;
    
    // Trạng thái game
    isGameOver = false;
    isGameRunning = false;
    gameObjects = [];

    // Sự kiện người dùng
    document.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('click', handleClick);
    
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('restart-button').addEventListener('click', restartGame);
    document.getElementById('portfolio-button').addEventListener('click', function() {
        window.location.href = '#about';
    });
    
    // Hiển thị màn hình bắt đầu
    document.getElementById('start-screen').style.display = 'flex';
    document.getElementById('game-over-screen').style.display = 'none';
    
    // Vẽ frame đầu tiên
    drawGame();
}

// Bắt đầu game
function startGame() {
    isGameRunning = true;
    isGameOver = false;
    document.getElementById('start-screen').style.display = 'none';
    gameLoop();
}

// Khởi động lại game
function restartGame() {
    init();
    startGame();
}

// Xử lý bàn phím
function handleKeyDown(event) {
    if (event.code === 'Space' && isGameRunning && !isGameOver) {
        const now = Date.now();
        const timeSinceLastJump = now - lastClickTime;
        
        if (timeSinceLastJump < config.doubleClickTime) {
            // Double jump
            player.jump(true);
        } else {
            // Regular jump
            player.jump();
        }
        
        lastClickTime = now;
    }
}

// Xử lý click chuột
function handleClick() {
    if (isGameRunning && !isGameOver) {
        const now = Date.now();
        const timeSinceLastClick = now - lastClickTime;
        
        if (timeSinceLastClick < config.doubleClickTime) {
            // Double click
            player.jump(true);
        } else {
            // Regular click
            player.jump();
        }
        
        lastClickTime = now;
    }
}

// Hiển thị thông tin kỹ năng
function showSkillPopup(skill) {
    const popup = document.getElementById('skill-popup');
    popup.innerHTML = `<strong>${skill.name}</strong><br>${skill.description}`;
    popup.style.display = 'block';
    popup.style.borderLeft = `5px solid ${skill.color}`;
    
    // Tự động ẩn popup sau 3 giây
    clearTimeout(skillPopupTimer);
    skillPopupTimer = setTimeout(() => {
        popup.style.display = 'none';
    }, 3000);
}

// Tạo đối tượng ngẫu nhiên
function spawnRandomObject() {
    const rand = Math.random();
    
    if (rand < 0.7) {
        // Tạo chướng ngại vật
        const obstacle = obstacles[Math.floor(Math.random() * obstacles.length)];
        const newObstacle = new Obstacle(
            canvas.width,
            canvas.height - config.groundHeight - obstacle.height,
            obstacle
        );
        gameObjects.push(newObstacle);
    } else {
        // Tạo biểu tượng kỹ năng
        const skill = skills[Math.floor(Math.random() * skills.length)];
        const yPos = canvas.height - config.groundHeight - 100 - Math.random() * 100;
        const newSkill = new SkillIcon(canvas.width, yPos, skill);
        gameObjects.push(newSkill);
    }
}

// Vòng lặp game
function gameLoop() {
    if (isGameOver) return;
    
    // Xóa canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Cập nhật điểm
    score += config.scoreIncrement;
    document.getElementById('score-display').textContent = `Điểm: ${Math.floor(score)}`;
    
    // Tạo đối tượng mới
    if (Math.random() < 0.02) {
        spawnRandomObject();
    }
    
    // Cập nhật người chơi
    player.update();
    
    // Cập nhật và kiểm tra va chạm
    for (let i = gameObjects.length - 1; i >= 0; i--) {
        const obj = gameObjects[i];
        obj.update();
        
        // Kiểm tra xem đối tượng đã ra khỏi màn hình chưa
        if (obj.x + obj.width < 0) {
            gameObjects.splice(i, 1);
            continue;
        }
        
        // Kiểm tra va chạm với người chơi
        if (player.isColliding(obj)) {
            if (obj.type === 'obstacle') {
                // Game over khi va chạm với chướng ngại vật
                gameOver();
                return;
            } else if (obj.type === 'skill') {
                // Thu thập kỹ năng
                showSkillPopup({name: obj.name, description: obj.description, color: obj.color});
                gameObjects.splice(i, 1);
                score += 10; // Thưởng điểm
            }
        }
    }
    
    // Vẽ game
    drawGame();
    
    // Tăng tốc độ game theo thời gian
    if (score > 0 && score % 100 === 0) {
        config.gameSpeed += 0.1;
        gameObjects.forEach(obj => {
            obj.speed = config.gameSpeed;
        });
    }
    
    // Tiếp tục vòng lặp
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Vẽ game
function drawGame() {
    // Vẽ nền
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Vẽ mặt đất
    ctx.fillStyle = '#333';
    ctx.fillRect(0, canvas.height - config.groundHeight, canvas.width, config.groundHeight);
    
    // Vẽ đường kẻ trên mặt đất
    ctx.strokeStyle = '#444';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - config.groundHeight);
    ctx.lineTo(canvas.width, canvas.height - config.groundHeight);
    ctx.stroke();
    
    // Vẽ các đối tượng game
    gameObjects.forEach(obj => obj.draw(ctx));
    
    // Vẽ người chơi
    player.draw(ctx);
}

// Kết thúc game
function gameOver() {
    isGameOver = true;
    isGameRunning = false;
    cancelAnimationFrame(animationFrameId);
    
    // Hiển thị màn hình kết thúc
    document.getElementById('final-score').textContent = `Điểm: ${Math.floor(score)}`;
    document.getElementById('game-over-screen').style.display = 'flex';
}

// Khởi tạo game khi trang tải xong
window.addEventListener('load', init); 