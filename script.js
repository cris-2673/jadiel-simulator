const canvas = document.querySelector("#game-canvas");
const context = canvas.getContext("2d");
const scoreElement = document.querySelector("#score");
const overlay = document.querySelector("#screen-overlay");
const overlayEyebrow = document.querySelector("#overlay-eyebrow");
const overlayTitle = document.querySelector("#overlay-title");
const overlayDescription = document.querySelector("#overlay-description");
const playButton = document.querySelector("#play-button");

const groundY = 270;
const dinosaur = {
  x: 105,
  y: groundY - 52,
  width: 55,
  height: 52,
  velocityY: 0,
  jumping: false
};

let barrels = [];
let score = 0;
let speed = 340;
let spawnTimer = 1.2;
let previousTime = 0;
let gameState = "menu";
let groundOffset = 0;

function drawBackground() {
  const sky = context.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#c8dfa9");
  sky.addColorStop(1, "#e5e6ae");
  context.fillStyle = sky;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "rgba(255, 248, 192, 0.75)";
  context.beginPath();
  context.arc(760, 70, 31, 0, Math.PI * 2);
  context.fill();

  drawHill(0, 225, 270, 112, "#a9ca8d");
  drawHill(240, 238, 330, 100, "#92bd7d");
  drawHill(570, 225, 350, 115, "#a2c78a");

  context.fillStyle = "#476f4d";
  context.fillRect(0, groundY, canvas.width, canvas.height - groundY);
  context.fillStyle = "#668e51";
  context.fillRect(0, groundY, canvas.width, 7);

  context.strokeStyle = "rgba(217, 220, 145, .5)";
  context.lineWidth = 3;
  context.setLineDash([22, 18]);
  context.lineDashOffset = -groundOffset;
  context.beginPath();
  context.moveTo(0, groundY + 27);
  context.lineTo(canvas.width, groundY + 27);
  context.stroke();
  context.setLineDash([]);

  drawPlant(45, groundY);
  drawPlant(710, groundY);
  drawPlant(850, groundY);
}

function drawHill(x, y, width, height, color) {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(x, y);
  context.quadraticCurveTo(x + width * 0.46, y - height, x + width, y);
  context.lineTo(x + width, groundY + 4);
  context.lineTo(x, groundY + 4);
  context.closePath();
  context.fill();
}

function drawPlant(x, y) {
  context.fillStyle = "#527a45";
  context.fillRect(x - 2, y - 22, 4, 22);
  context.beginPath();
  context.ellipse(x - 7, y - 16, 8, 3, -.55, 0, Math.PI * 2);
  context.ellipse(x + 7, y - 20, 8, 3, .55, 0, Math.PI * 2);
  context.fill();
}

function drawDinosaur() {
  const runOffset = gameState === "running" && !dinosaur.jumping
    ? Math.sin(performance.now() / 65) * 3
    : 0;
  const x = dinosaur.x;
  const y = dinosaur.y + runOffset;

  context.save();
  context.translate(x, y);
  context.fillStyle = "#27694d";

  context.beginPath();
  context.moveTo(12, 30);
  context.lineTo(-14, 43);
  context.lineTo(15, 40);
  context.closePath();
  context.fill();

  context.beginPath();
  context.moveTo(13, 31);
  context.lineTo(22, 7);
  context.lineTo(38, -1);
  context.lineTo(43, 9);
  context.lineTo(54, 11);
  context.lineTo(54, 25);
  context.lineTo(43, 26);
  context.lineTo(39, 43);
  context.lineTo(8, 43);
  context.closePath();
  context.fill();

  context.fillStyle = "#4c9960";
  context.beginPath();
  context.moveTo(20, 11);
  context.lineTo(28, -3);
  context.lineTo(31, 8);
  context.lineTo(38, -7);
  context.lineTo(40, 13);
  context.closePath();
  context.fill();

  context.fillStyle = "#d5e28c";
  context.beginPath();
  context.ellipse(39, 22, 10, 5, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#f4f3d9";
  context.beginPath();
  context.arc(44, 8, 2.5, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#172d2a";
  context.beginPath();
  context.arc(45, 8, 1, 0, Math.PI * 2);
  context.fill();

  const legSwing = dinosaur.jumping ? 0 : Math.sin(performance.now() / 55) * 5;
  context.strokeStyle = "#204f3c";
  context.lineWidth = 6;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(20, 39);
  context.lineTo(18 + legSwing, 49);
  context.lineTo(11 + legSwing, 49);
  context.moveTo(34, 39);
  context.lineTo(36 - legSwing, 49);
  context.lineTo(43 - legSwing, 49);
  context.stroke();
  context.restore();
}

function drawBarrel(barrel) {
  const { x, y, width, height } = barrel;
  context.fillStyle = "#263a35";
  context.beginPath();
  context.roundRect(x, y, width, height, 7);
  context.fill();

  context.fillStyle = "#bb713c";
  context.fillRect(x + 3, y + 7, width - 6, 5);
  context.fillRect(x + 3, y + height - 12, width - 6, 5);
  context.fillStyle = "#d89a53";
  context.fillRect(x + 8, y + 3, 5, height - 6);
  context.fillStyle = "#1a2925";
  context.beginPath();
  context.ellipse(x + width / 2, y + 3, width / 2 - 2, 4, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#e0ab63";
  context.font = "bold 12px Trebuchet MS, sans-serif";
  context.textAlign = "center";
  context.fillText("OIL", x + width / 2, y + height / 2 + 4);
}

function draw() {
  drawBackground();
  barrels.forEach(drawBarrel);
  drawDinosaur();
}

function startGame() {
  score = 0;
  speed = 340;
  spawnTimer = 1.2;
  barrels = [];
  dinosaur.y = groundY - dinosaur.height;
  dinosaur.velocityY = 0;
  dinosaur.jumping = false;
  gameState = "running";
  overlay.hidden = true;
  scoreElement.textContent = "00000";
  previousTime = performance.now();
}

function jump() {
  if (gameState !== "running" || dinosaur.jumping) return;
  dinosaur.velocityY = -690;
  dinosaur.jumping = true;
}

function finishGame() {
  gameState = "gameover";
  overlay.hidden = false;
  overlayEyebrow.textContent = "FIN DE LA CARRERA";
  overlayTitle.textContent = "¡Chocaste con un barril!";
  overlayDescription.textContent = `Tu puntaje fue ${Math.floor(score)}. ¿Intentamos otra vez?`;
  playButton.innerHTML = 'Reiniciar <span aria-hidden="true">↻</span>';
}

function update(delta) {
  if (gameState !== "running") return;

  score += delta * 10;
  speed = Math.min(620, speed + delta * 5);
  groundOffset = (groundOffset + speed * delta) % 40;
  scoreElement.textContent = String(Math.floor(score)).padStart(5, "0");

  dinosaur.velocityY += 1850 * delta;
  dinosaur.y += dinosaur.velocityY * delta;
  if (dinosaur.y >= groundY - dinosaur.height) {
    dinosaur.y = groundY - dinosaur.height;
    dinosaur.velocityY = 0;
    dinosaur.jumping = false;
  }

  spawnTimer -= delta;
  if (spawnTimer <= 0) {
    barrels.push({ x: canvas.width + 10, y: groundY - 39, width: 35, height: 39 });
    spawnTimer = 1.15 + Math.random() * 1.05;
  }

  barrels.forEach((barrel) => {
    barrel.x -= speed * delta;
    const overlaps = dinosaur.x + dinosaur.width - 9 > barrel.x + 4
      && dinosaur.x + 10 < barrel.x + barrel.width - 4
      && dinosaur.y + dinosaur.height - 4 > barrel.y + 4;
    if (overlaps) finishGame();
  });
  barrels = barrels.filter((barrel) => barrel.x + barrel.width > 0);
}

function frame(time) {
  const delta = Math.min((time - previousTime) / 1000, 0.04);
  previousTime = time;
  update(delta);
  draw();
  requestAnimationFrame(frame);
}

playButton.addEventListener("click", startGame);
canvas.addEventListener("pointerdown", jump);
window.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();
    jump();
  }
});

requestAnimationFrame((time) => {
  previousTime = time;
  frame(time);
});