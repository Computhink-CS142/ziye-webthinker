const LEVEL_LENGTH = 7700;
const PLAYER_SIZE = 42;
const FLOOR_HEIGHT = 34;
const RUN_SPEED = 7;
const JUMP_SPEED = -18;
const SPIKE_WIDTH = 44;
const SPIKE_HEIGHT = 42;
const SPIKE_DISTANCES = [
  700, 1200, 1255, 1700, 2160, 2215, 2270, 2800,
  3260, 3315, 3760, 4220, 4275, 4590, 5030, 5085,
  5480, 5850, 5905, 6280, 6700, 6755, 7120
];

let player;
let floorBody;
let gameState = "ready";
let progress = 0;
let groundY;
let playerX;
let grounded = false;

function setup() {
  new Canvas(windowWidth, windowHeight);
  world.gravity.y = 28;
  playerX = width * 0.2;
  groundY = height * 0.8;

  floorBody = new Sprite(width / 2, groundY + FLOOR_HEIGHT / 2, width + 200, FLOOR_HEIGHT, STATIC);
  floorBody.autoDraw = false;
  floorBody.color = "#252344";
  floorBody.stroke = "#58f2d1";
  floorBody.strokeWeight = 2;

  player = new Sprite(playerX, groundY - PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);
  player.autoDraw = false;
  player.color = "#58f2d1";
  player.stroke = "#d7fff6";
  player.strokeWeight = 2;
  player.bounciness = 0;
  player.friction = 0;
  player.rotationLock = true;
}

function draw() {
  background("#101020");
  drawBackground();

  if (gameState === "playing") {
    updateGame();
  }

  drawLevel();
  drawHud();

  if (gameState !== "playing") {
    drawOverlay();
  }
}

function updateGame() {
  const frameScale = Math.min(deltaTime, 50) / (1000 / 60);
  progress = Math.min(LEVEL_LENGTH, progress + RUN_SPEED * frameScale);

  player.x = playerX;
  if (player.y + PLAYER_SIZE / 2 >= groundY - 1 && player.vel.y >= 0) {
    player.y = groundY - PLAYER_SIZE / 2;
    player.vel.y = 0;
    grounded = true;
  } else {
    grounded = false;
  }

  if (grounded && keyIsDown(32)) {
    jump();
  }

  for (const distance of SPIKE_DISTANCES) {
    const spikeX = playerX + distance - progress;
    if (spikeX < -SPIKE_WIDTH || spikeX > width + SPIKE_WIDTH) {
      continue;
    }

    const overlapsHorizontally =
      player.x + PLAYER_SIZE / 2 > spikeX - SPIKE_WIDTH / 2 &&
      player.x - PLAYER_SIZE / 2 < spikeX + SPIKE_WIDTH / 2;
    const overlapsVertically =
      player.y + PLAYER_SIZE / 2 > groundY - SPIKE_HEIGHT;

    if (overlapsHorizontally && overlapsVertically) {
      gameState = "lost";
      return;
    }
  }

  if (progress >= LEVEL_LENGTH) {
    gameState = "won";
  }
}

function drawBackground() {
  noStroke();
  for (let x = 0; x < width; x += 48) {
    for (let y = 0; y < height; y += 48) {
      fill((x / 48 + y / 48) % 2 === 0 ? "#15152a" : "#121225");
      rect(x, y, 46, 46);
    }
  }

  stroke("#29294a");
  strokeWeight(1);
  for (let y = 48; y < groundY; y += 48) {
    line(0, y, width, y);
  }
  noStroke();
}

function drawLevel() {
  noStroke();
  fill("#252344");
  rect(0, groundY, width, height - groundY);

  stroke("#58f2d1");
  strokeWeight(3);
  line(0, groundY, width, groundY);
  noStroke();

  for (const distance of SPIKE_DISTANCES) {
    const spikeX = playerX + distance - progress;
    if (spikeX < -SPIKE_WIDTH || spikeX > width + SPIKE_WIDTH) {
      continue;
    }

    fill("#ff5478");
    stroke("#ffd1dc");
    strokeWeight(2);
    triangle(
      spikeX - SPIKE_WIDTH / 2,
      groundY,
      spikeX,
      groundY - SPIKE_HEIGHT,
      spikeX + SPIKE_WIDTH / 2,
      groundY
    );
  }
  noStroke();

  push();
  translate(player.x, player.y);
  rotate(player.rotation);
  fill("#58f2d1");
  stroke("#d7fff6");
  strokeWeight(2);
  rectMode(CENTER);
  rect(0, 0, PLAYER_SIZE, PLAYER_SIZE, 4);
  pop();
  rectMode(CORNER);
}

function drawHud() {
  const barWidth = Math.min(360, width * 0.42);
  const barX = width / 2 - barWidth / 2;
  const percent = Math.floor((progress / LEVEL_LENGTH) * 100);

  noStroke();
  fill("#d7d9ff");
  textAlign(CENTER, TOP);
  textSize(15);
  text("STEREO MADNESS", width / 2, 20);

  fill("#30304d");
  rect(barX, 47, barWidth, 10, 5);
  fill("#58f2d1");
  rect(barX, 47, barWidth * (progress / LEVEL_LENGTH), 10, 5);

  fill("#d7d9ff");
  textSize(12);
  text(`${percent}%`, width / 2, 64);
}

function drawOverlay() {
  const heading = gameState === "ready" ? "GEOMETRY DASH" :
    gameState === "won" ? "LEVEL COMPLETE!" : "CRASH!";
  const message = gameState === "ready"
    ? "Jump over every spike and reach the finish."
    : gameState === "won"
      ? "Stereo Madness cleared!"
      : "You made it " + Math.floor((progress / LEVEL_LENGTH) * 100) + "% of the way.";
  const action = gameState === "ready"
    ? "PRESS SPACE OR CLICK TO START"
    : "PRESS SPACE OR CLICK TO PLAY AGAIN";

  noStroke();
  fill(8, 8, 20, 190);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  fill(gameState === "lost" ? "#ff7894" : "#58f2d1");
  textSize(Math.min(48, width / 9));
  text(heading, width / 2, height / 2 - 58);

  fill("#e5e6ff");
  textSize(Math.min(18, width / 24));
  text(message, width / 2, height / 2);

  fill("#d7d9ff");
  textSize(Math.min(15, width / 28));
  text(action, width / 2, height / 2 + 46);
}

function jump() {
  if (!grounded || gameState !== "playing") {
    return;
  }

  player.vel.y = JUMP_SPEED;
  grounded = false;
}

function startOrRestart() {
  progress = 0;
  player.x = playerX;
  player.y = groundY - PLAYER_SIZE / 2;
  player.vel.x = 0;
  player.vel.y = 0;
  grounded = true;
  gameState = "playing";
}

function keyPressed() {
  if (keyCode === 32) {
    if (gameState !== "playing") {
      startOrRestart();
    } else {
      jump();
    }
    return false;
  }
}

function mousePressed() {
  if (gameState !== "playing") {
    startOrRestart();
  } else {
    jump();
  }
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  playerX = width * 0.2;
  groundY = height * 0.8;
  floorBody.x = width / 2;
  floorBody.y = groundY + FLOOR_HEIGHT / 2;
  floorBody.w = width + 200;
  player.x = playerX;

  if (player.y + PLAYER_SIZE / 2 > groundY) {
    player.y = groundY - PLAYER_SIZE / 2;
    player.vel.y = 0;
    grounded = true;
  }
}
