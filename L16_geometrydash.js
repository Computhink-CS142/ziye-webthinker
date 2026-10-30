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
const PLATFORM_LAYOUT = [
  { distance: 930, width: 150, elevation: 48 },
  { distance: 1540, width: 126, elevation: 54 },
  { distance: 2480, width: 176, elevation: 44 },
  { distance: 3600, width: 150, elevation: 52 },
  { distance: 4780, width: 176, elevation: 46 },
  { distance: 5650, width: 142, elevation: 54 },
  { distance: 6920, width: 180, elevation: 48 }
];
const BLOCK_LAYOUT = [
  { distance: 1880, width: 42, height: 42 },
  { distance: 3000, width: 42, height: 42 },
  { distance: 4090, width: 42, height: 42 },
  { distance: 5200, width: 42, height: 42 },
  { distance: 6140, width: 42, height: 42 }
];
const SHARD_LAYOUT = [
  { distance: 970, elevation: 105 },
  { distance: 2490, elevation: 104 },
  { distance: 4810, elevation: 106 },
  { distance: 5670, elevation: 112 },
  { distance: 6930, elevation: 106 }
];

let player;
let floorBody;
let gameState = "ready";
let progress = 0;
let groundY;
let playerX;
let grounded = false;
let previousPlayerBottom;
let collectedShards = new Set();

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
  previousPlayerBottom = groundY;
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
  grounded = false;
  if (player.vel.y >= 0) {
    let landingTop = Infinity;
    const playerBottom = player.y + PLAYER_SIZE / 2;

    for (const platform of PLATFORM_LAYOUT) {
      const platformX = playerX + platform.distance - progress;
      const platformTop = groundY - platform.elevation;
      const overlapsHorizontally =
        playerX + PLAYER_SIZE / 2 > platformX - platform.width / 2 &&
        playerX - PLAYER_SIZE / 2 < platformX + platform.width / 2;
      const crossedPlatformTop =
        previousPlayerBottom <= platformTop &&
        playerBottom >= platformTop;

      if (overlapsHorizontally && crossedPlatformTop) {
        landingTop = Math.min(landingTop, platformTop);
      }
    }

    for (const block of BLOCK_LAYOUT) {
      const blockX = playerX + block.distance - progress;
      const blockTop = groundY - block.height;
      const overlapsHorizontally =
        playerX + PLAYER_SIZE / 2 > blockX - block.width / 2 &&
        playerX - PLAYER_SIZE / 2 < blockX + block.width / 2;
      const crossedBlockTop =
        previousPlayerBottom <= blockTop &&
        playerBottom >= blockTop;

      if (overlapsHorizontally && crossedBlockTop) {
        landingTop = Math.min(landingTop, blockTop);
      }
    }

    if (landingTop !== Infinity) {
      player.y = landingTop - PLAYER_SIZE / 2;
      player.vel.y = 0;
      grounded = true;
    } else if (playerBottom >= groundY - 1) {
      player.y = groundY - PLAYER_SIZE / 2;
      player.vel.y = 0;
      grounded = true;
    }
  }

  previousPlayerBottom = player.y + PLAYER_SIZE / 2;

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
    const overlapsVertically = player.y + PLAYER_SIZE / 2 > groundY - SPIKE_HEIGHT;

    if (overlapsHorizontally && overlapsVertically) {
      gameState = "lost";
      return;
    }
  }

  for (const block of BLOCK_LAYOUT) {
    const blockX = playerX + block.distance - progress;
    const blockTop = groundY - block.height;
    const overlapsHorizontally =
      playerX + PLAYER_SIZE / 2 > blockX - block.width / 2 &&
      playerX - PLAYER_SIZE / 2 < blockX + block.width / 2;
    const overlapsVertically =
      player.y + PLAYER_SIZE / 2 > blockTop + 1 &&
      player.y - PLAYER_SIZE / 2 < groundY;

    if (overlapsHorizontally && overlapsVertically) {
      gameState = "lost";
      return;
    }
  }

  SHARD_LAYOUT.forEach((shard, index) => {
    if (collectedShards.has(index)) {
      return;
    }

    const shardX = playerX + shard.distance - progress;
    const shardY = groundY - shard.elevation;
    if (
      Math.abs(player.x - shardX) < PLAYER_SIZE / 2 + 14 &&
      Math.abs(player.y - shardY) < PLAYER_SIZE / 2 + 14
    ) {
      collectedShards.add(index);
    }
  });

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

  for (const platform of PLATFORM_LAYOUT) {
    const platformX = playerX + platform.distance - progress;
    if (
      platformX < -platform.width ||
      platformX > width + platform.width
    ) {
      continue;
    }

    const platformTop = groundY - platform.elevation;
    fill("#393762");
    stroke("#8b8aff");
    strokeWeight(2);
    rectMode(CENTER);
    rect(platformX, platformTop + 8, platform.width, 16, 3);
    noStroke();
    fill("#c5c2ff");
    rect(platformX, platformTop, platform.width, 4, 2);
    rectMode(CORNER);
  }

  for (const block of BLOCK_LAYOUT) {
    const blockX = playerX + block.distance - progress;
    if (blockX < -block.width || blockX > width + block.width) {
      continue;
    }

    const blockTop = groundY - block.height;
    rectMode(CENTER);
    fill("#584f9c");
    stroke("#b5aaff");
    strokeWeight(2);
    rect(blockX, blockTop + block.height / 2, block.width, block.height, 3);
    noStroke();
    fill("#8078c4");
    rect(blockX, blockTop + block.height / 2, block.width - 12, 4);
    rectMode(CORNER);
  }

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

  SHARD_LAYOUT.forEach((shard, index) => {
    if (collectedShards.has(index)) {
      return;
    }

    const shardX = playerX + shard.distance - progress;
    if (shardX < -24 || shardX > width + 24) {
      return;
    }

    const shardY = groundY - shard.elevation;
    push();
    translate(shardX, shardY);
    rotate(45);
    fill("#ffd966");
    stroke("#fff2bd");
    strokeWeight(2);
    rectMode(CENTER);
    rect(0, 0, 20, 20, 3);
    pop();
    rectMode(CORNER);
  });

  const finishX = playerX + LEVEL_LENGTH - progress;
  if (finishX > -40 && finishX < width + 40) {
    noFill();
    stroke("#ffd966");
    strokeWeight(5);
    ellipse(finishX, groundY - 52, 48, 96);
    stroke("#fff2bd");
    strokeWeight(2);
    ellipse(finishX, groundY - 52, 28, 76);
    noStroke();
  }

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

  textAlign(RIGHT, TOP);
  textSize(14);
  text(`SHARDS ${collectedShards.size}/${SHARD_LAYOUT.length}`, width - 18, 20);
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
  previousPlayerBottom = groundY;
  collectedShards = new Set();
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
  previousPlayerBottom = player.y + PLAYER_SIZE / 2;
}
