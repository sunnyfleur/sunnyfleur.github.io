(function () {
  const config = {
    gravity: 0.6,
    jumpForce: -13,
    superJumpForce: -18,
    groundHeight: 60,
    playerWidth: 40,
    playerHeight: 50,
    gameSpeed: 5,
    scoreIncrement: 0.1,
    doubleClickTime: 300,
  };

  const skills = [
    {
      name: "Unity",
      description: "Gameplay prototyping and implementation literacy in Unity.",
      descriptionVi: "Prototype gameplay và hiểu ràng buộc implementation trong Unity.",
      color: "#00ccff",
    },
    {
      name: "Game Design",
      description: "Core loops, player goals, pacing, tuning, and progression systems.",
      descriptionVi: "Core loop, player goal, pacing, tuning và progression systems.",
      color: "#ff6600",
    },
    {
      name: "Feature Ownership",
      description: "Carrying gameplay features from intent and spec to production support.",
      descriptionVi: "Theo gameplay feature từ intent, spec đến production support.",
      color: "#ff33cc",
    },
    {
      name: "KPI Analysis",
      description: "Using playtest and KPI signals as support for tuning decisions.",
      descriptionVi: "Dùng playtest và KPI signal để hỗ trợ quyết định tuning.",
      color: "#ffcc00",
    },
    {
      name: "Documentation",
      description: "Writing clear handoff notes, feature specs, and design breakdowns.",
      descriptionVi: "Viết handoff note, feature spec và design breakdown rõ ràng.",
      color: "#33ccff",
    },
  ];

  const obstacles = [
    { name: "Bug", width: 40, height: 40, color: "#ff3333" },
    { name: "Deadline", width: 60, height: 30, color: "#ff0000" },
    { name: "Scope", width: 50, height: 50, color: "#663399" },
  ];

  let canvas;
  let ctx;
  let player;
  let score = 0;
  let gameObjects = [];
  let isGameOver = false;
  let isGameRunning = false;
  let lastClickTime = 0;
  let skillPopupTimer = null;
  let animationFrameId = null;
  let eventsBound = false;

  function getI18n() {
    return window.PortfolioI18n || null;
  }

  function getLanguage() {
    const i18n = getI18n();
    return i18n && typeof i18n.getLanguage === "function" ? i18n.getLanguage() : "en";
  }

  function t(key, fallback, params) {
    const i18n = getI18n();
    return i18n && typeof i18n.t === "function" ? i18n.t(key, fallback, params) : fallback;
  }

  function localizeUrl(url) {
    const i18n = getI18n();
    return i18n && typeof i18n.localizeUrl === "function" ? i18n.localizeUrl(url, getLanguage()) : url;
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  function scoreText() {
    return t("runner.score", "Score: {score}", { score: Math.floor(score) });
  }

  function updateStaticText() {
    setText("runner-subtitle", t("runner.subtitle", "Explore my skills and achievements"));
    setText("runner-instructions", t("runner.instructions", "Press Space or click to jump. Double-click to jump higher."));
    setText("start-button", t("runner.start", "START RUNNING"));
    setText("game-over-title", t("runner.gameOver", "GAME OVER"));
    setText("restart-button", t("runner.restart", "PLAY AGAIN"));
    setText("portfolio-button", t("runner.portfolio", "VIEW PORTFOLIO"));
    updateScoreDisplay();
  }

  function updateScoreDisplay() {
    setText("score-display", scoreText());
    setText("final-score", scoreText());
  }

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

    draw(targetCtx) {
      targetCtx.fillStyle = this.color;
      targetCtx.fillRect(this.x, this.y, this.width, this.height);

      if (this.type === "obstacle") {
        targetCtx.fillStyle = "white";
        targetCtx.font = "12px Arial";
        const textWidth = targetCtx.measureText(this.name).width;
        targetCtx.fillText(this.name, this.x + this.width / 2 - textWidth / 2, this.y + this.height / 2 + 4);
      }
    }

    isColliding(other) {
      return !(
        this.x + this.width < other.x
        || this.x > other.x + other.width
        || this.y + this.height < other.y
        || this.y > other.y + other.height
      );
    }
  }

  class Player extends GameObject {
    constructor(x, y) {
      super(x, y, config.playerWidth, config.playerHeight, 0, "player", "#f5a905", "Player");
      this.velocityY = 0;
      this.isGrounded = true;
      this.frameCount = 0;
      this.legPosition = 0;
    }

    update() {
      if (!this.isGrounded) {
        this.velocityY += config.gravity;
        this.y += this.velocityY;
      }

      const groundY = canvas.height - config.groundHeight - this.height;
      if (this.y >= groundY) {
        this.y = groundY;
        this.isGrounded = true;
        this.velocityY = 0;
      }

      this.frameCount += 1;
      if (this.frameCount % 6 === 0) {
        this.legPosition = (this.legPosition + 1) % 4;
      }
    }

    jump(superJump) {
      if (this.isGrounded) {
        this.velocityY = superJump ? config.superJumpForce : config.jumpForce;
        this.isGrounded = false;
      }
    }

    draw(targetCtx) {
      targetCtx.fillStyle = this.color;
      targetCtx.fillRect(this.x + 10, this.y + 10, this.width - 20, this.height - 20);
      targetCtx.fillRect(this.x + 15, this.y, this.width - 30, 15);

      targetCtx.fillStyle = "#000";
      targetCtx.fillRect(this.x + 25, this.y + 5, 5, 5);

      if (this.isGrounded && this.legPosition % 2 === 0) {
        targetCtx.fillRect(this.x + 15, this.y + this.height - 10, 8, 10);
        targetCtx.fillRect(this.x + this.width - 23, this.y + this.height - 15, 8, 15);
      } else {
        targetCtx.fillRect(this.x + 15, this.y + this.height - 15, 8, 15);
        targetCtx.fillRect(this.x + this.width - 23, this.y + this.height - 10, 8, 10);
      }
    }
  }

  class SkillIcon extends GameObject {
    constructor(x, y, skill) {
      super(x, y, 30, 30, config.gameSpeed, "skill", skill.color, skill.name);
      this.description = getLanguage() === "vi" ? skill.descriptionVi : skill.description;
    }

    draw(targetCtx) {
      targetCtx.fillStyle = this.color;
      targetCtx.beginPath();
      targetCtx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
      targetCtx.fill();

      targetCtx.fillStyle = "white";
      targetCtx.font = "bold 12px Arial";
      const textWidth = targetCtx.measureText(this.name.charAt(0)).width;
      targetCtx.fillText(this.name.charAt(0), this.x + this.width / 2 - textWidth / 2, this.y + this.height / 2 + 4);
    }
  }

  class Obstacle extends GameObject {
    constructor(x, y, obstacle) {
      super(x, y, obstacle.width, obstacle.height, config.gameSpeed, "obstacle", obstacle.color, obstacle.name);
    }
  }

  function resizeCanvas() {
    const container = document.getElementById("game-container");
    const width = Math.max(320, Math.round(container ? container.clientWidth : canvas.clientWidth || 800));
    const height = Math.max(240, Math.round(container ? container.clientHeight : canvas.clientHeight || 400));

    canvas.width = width;
    canvas.height = height;

    if (player) {
      player.y = Math.min(player.y, canvas.height - config.groundHeight - config.playerHeight);
    }

    drawGame();
  }

  function resetState() {
    config.gameSpeed = 5;
    player = new Player(100, canvas.height - config.groundHeight - config.playerHeight);
    score = 0;
    isGameOver = false;
    isGameRunning = false;
    gameObjects = [];
    updateScoreDisplay();
  }

  function bindEvents() {
    if (eventsBound) {
      return;
    }

    eventsBound = true;
    document.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("click", handleClick);
    window.addEventListener("resize", resizeCanvas);
    document.getElementById("start-button").addEventListener("click", startGame);
    document.getElementById("restart-button").addEventListener("click", restartGame);
    document.getElementById("portfolio-button").addEventListener("click", function () {
      window.location.href = localizeUrl("index.html#about");
    });
  }

  function init() {
    canvas = document.getElementById("game-canvas");
    if (!canvas) {
      return;
    }

    ctx = canvas.getContext("2d");
    bindEvents();
    resizeCanvas();
    resetState();
    updateStaticText();
    document.getElementById("start-screen").style.display = "flex";
    document.getElementById("game-over-screen").style.display = "none";
    drawGame();
  }

  function startGame() {
    isGameRunning = true;
    isGameOver = false;
    document.getElementById("start-screen").style.display = "none";
    gameLoop();
  }

  function restartGame() {
    resetState();
    startGame();
  }

  function jumpFromInput() {
    if (!isGameRunning || isGameOver) {
      return;
    }

    const now = Date.now();
    const timeSinceLastInput = now - lastClickTime;
    player.jump(timeSinceLastInput < config.doubleClickTime);
    lastClickTime = now;
  }

  function handleKeyDown(event) {
    if (event.code === "Space") {
      event.preventDefault();
      jumpFromInput();
    }
  }

  function handleClick() {
    jumpFromInput();
  }

  function showSkillPopup(skill) {
    const popup = document.getElementById("skill-popup");
    popup.innerHTML = "<strong>" + skill.name + "</strong><br>" + skill.description;
    popup.style.display = "block";
    popup.style.borderLeft = "5px solid " + skill.color;

    clearTimeout(skillPopupTimer);
    skillPopupTimer = setTimeout(function () {
      popup.style.display = "none";
    }, 3000);
  }

  function spawnRandomObject() {
    if (Math.random() < 0.7) {
      const obstacle = obstacles[Math.floor(Math.random() * obstacles.length)];
      gameObjects.push(new Obstacle(canvas.width, canvas.height - config.groundHeight - obstacle.height, obstacle));
      return;
    }

    const skill = skills[Math.floor(Math.random() * skills.length)];
    const yPos = canvas.height - config.groundHeight - 100 - Math.random() * 100;
    gameObjects.push(new SkillIcon(canvas.width, yPos, skill));
  }

  function gameLoop() {
    if (isGameOver) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    score += config.scoreIncrement;
    updateScoreDisplay();

    if (Math.random() < 0.02) {
      spawnRandomObject();
    }

    player.update();

    for (let index = gameObjects.length - 1; index >= 0; index -= 1) {
      const object = gameObjects[index];
      object.update();

      if (object.x + object.width < 0) {
        gameObjects.splice(index, 1);
        continue;
      }

      if (player.isColliding(object)) {
        if (object.type === "obstacle") {
          gameOver();
          return;
        }

        showSkillPopup({ name: object.name, description: object.description, color: object.color });
        gameObjects.splice(index, 1);
        score += 10;
      }
    }

    drawGame();

    if (score > 0 && Math.floor(score) % 100 === 0) {
      config.gameSpeed += 0.1;
      gameObjects.forEach(function (object) {
        object.speed = config.gameSpeed;
      });
    }

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function drawGame() {
    if (!ctx || !canvas) {
      return;
    }

    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#333";
    ctx.fillRect(0, canvas.height - config.groundHeight, canvas.width, config.groundHeight);

    ctx.strokeStyle = "#444";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - config.groundHeight);
    ctx.lineTo(canvas.width, canvas.height - config.groundHeight);
    ctx.stroke();

    gameObjects.forEach(function (object) {
      object.draw(ctx);
    });

    if (player) {
      player.draw(ctx);
    }
  }

  function gameOver() {
    isGameOver = true;
    isGameRunning = false;
    cancelAnimationFrame(animationFrameId);
    updateScoreDisplay();
    document.getElementById("game-over-screen").style.display = "flex";
  }

  function boot() {
    const i18n = getI18n();
    const ready = i18n && typeof i18n.whenReady === "function" ? i18n.whenReady() : Promise.resolve();
    ready.then(init);
  }

  window.addEventListener("load", boot);
})();
