const TILE_SIZE = 32;
const WORLD_COLUMNS = 102;
const WORLD_ROWS = 24;
const WORLD_WIDTH = WORLD_COLUMNS * TILE_SIZE;
const WORLD_HEIGHT = WORLD_ROWS * TILE_SIZE;

const TILE_COLORS = {
  grass: "#5caa49",
  dirt: "#80512f",
  stone: "#777b83",
  wood: "#9b6236",
  leaves: "#3d843e",
  iron: "#b47655",
  crystal: "#57d9dc"
};

let terrain = [];
let surfaceRows = [];
let hero;
let heroSprite;
let boss;
let cameraX = 0;
let cameraY = 0;
let gameState = "title";
let selectedSlot = 0;
let dayTimer = 0;
let invulnerability = 0;
let message = "";
let messageTimer = 0;
let forgeButton;

const hotbar = [
  { name: "Pickaxe", type: "tool" },
  { name: "Dirt", type: "dirt" },
  { name: "Stone", type: "stone" },
  { name: "Wood", type: "wood" },
  { name: "Iron", type: "iron" },
  { name: "Crystal", type: "crystal" },
  { name: "Empty", type: "empty" },
  { name: "Empty", type: "empty" },
  { name: "Blade", type: "sword" }
];

function setup() {
  new Canvas(windowWidth, windowHeight);
  pixelDensity(1);
  textFont("monospace");
  buildWorld();
  resetGame();
}

function buildWorld() {
  terrain = Array.from({ length: WORLD_COLUMNS }, () => Array(WORLD_ROWS).fill(null));
  surfaceRows = [];

  for (let column = 0; column < WORLD_COLUMNS; column++) {
    let surface = Math.floor(
      12 + Math.sin(column * 0.19) * 1.1 + Math.sin(column * 0.065) * 1.1
    );
    if (column >= 88) surface = 12;
    surface = constrain(surface, 9, 15);
    surfaceRows[column] = surface;

    for (let row = surface; row < WORLD_ROWS; row++) {
      if (row === surface) terrain[column][row] = "grass";
      else if (row < surface + 4) terrain[column][row] = "dirt";
      else terrain[column][row] = "stone";
    }
  }

  for (const column of [12, 17, 23, 30, 37]) {
    terrain[column][surfaceRows[column]] = "iron";
  }
  for (const column of [44, 54, 65]) {
    terrain[column][surfaceRows[column]] = "crystal";
  }

  for (const column of [6, 33, 48, 72]) {
    if (column >= 88) continue;
    const ground = surfaceRows[column];
    terrain[column][ground - 1] = "wood";
    terrain[column][ground - 2] = "wood";
    terrain[column][ground - 3] = "wood";
    for (let leafColumn = column - 2; leafColumn <= column + 2; leafColumn++) {
      for (let leafRow = ground - 5; leafRow <= ground - 3; leafRow++) {
        if (
          leafColumn >= 0 &&
          leafColumn < WORLD_COLUMNS &&
          terrain[leafColumn][leafRow] === null
        ) {
          terrain[leafColumn][leafRow] = "leaves";
        }
      }
    }
  }
}

function resetGame() {
  const startX = TILE_SIZE * 3;
  const startGround = surfaceRows[3] * TILE_SIZE;
  hero = {
    x: startX,
    y: startGround - 16,
    velocityX: 0,
    velocityY: 0,
    width: 22,
    height: 30,
    health: 100,
    grounded: false,
    iron: 0,
    crystal: 0,
    dirt: 10,
    stone: 5,
    wood: 4,
    hasBlade: false
  };
  heroSprite = new Sprite(hero.x, hero.y, hero.width, hero.height);
  heroSprite.physics = NONE;
  heroSprite.visible = false;

  boss = {
    x: TILE_SIZE * 95,
    y: surfaceRows[95] * TILE_SIZE - 43,
    health: 100,
    state: "sleeping",
    timer: 0,
    fireball: null,
    flash: 0
  };

  cameraX = 0;
  cameraY = 0;
  selectedSlot = 0;
  dayTimer = 0;
  invulnerability = 0;
  message = "";
  messageTimer = 0;
  gameState = "title";
}

function update() {
  background("#87c8ed");

  if (gameState === "title") {
    drawWorld();
    drawHero();
    drawHud();
    drawTitleScreen();
    return;
  }
  if (gameState === "won" || gameState === "lost") {
    drawWorld();
    drawHero();
    drawHud();
    drawEndScreen();
    return;
  }

  updateHero();
  updateBoss();
  updateCamera();
  dayTimer = (dayTimer + 1) % 3600;
  if (invulnerability > 0) invulnerability--;
  if (messageTimer > 0) messageTimer--;

  drawWorld();
  drawBoss();
  drawHero();
  drawDayNight();
  drawHud();
}

function updateHero() {
  const moveSpeed = 3.2;
  hero.velocityX = 0;
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) hero.velocityX -= moveSpeed;
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) hero.velocityX += moveSpeed;

  if (hero.velocityX !== 0) {
    const nextX = hero.x + hero.velocityX;
    if (!heroTouchesSolid(nextX, hero.y)) hero.x = nextX;
  }

  hero.velocityY = Math.min(hero.velocityY + 0.55, 12);
  const nextY = hero.y + hero.velocityY;
  if (!heroTouchesSolid(hero.x, nextY)) {
    hero.y = nextY;
    hero.grounded = false;
  } else {
    if (hero.velocityY > 0) hero.grounded = true;
    hero.velocityY = 0;
  }

  hero.x = constrain(hero.x, hero.width / 2, WORLD_WIDTH - hero.width / 2);
  if (hero.y > WORLD_HEIGHT) {
    hero.health = 0;
    gameState = "lost";
  }
  heroSprite.x = hero.x;
  heroSprite.y = hero.y;
}

function heroTouchesSolid(centerX, centerY) {
  const left = centerX - hero.width / 2 + 2;
  const right = centerX + hero.width / 2 - 2;
  const top = centerY - hero.height / 2 + 2;
  const bottom = centerY + hero.height / 2 - 2;
  return (
    isSolidAt(left, top) ||
    isSolidAt(right, top) ||
    isSolidAt(left, bottom) ||
    isSolidAt(right, bottom)
  );
}

function isSolidAt(worldX, worldY) {
  if (worldX < 0 || worldX >= WORLD_WIDTH || worldY >= WORLD_HEIGHT) return true;
  if (worldY < 0) return false;
  const column = Math.floor(worldX / TILE_SIZE);
  const row = Math.floor(worldY / TILE_SIZE);
  return terrain[column][row] !== null;
}

function updateBoss() {
  if (boss.state === "defeated") return;
  if (boss.state === "sleeping" && Math.abs(hero.x - boss.x) < 520) {
    boss.state = "idle";
    setMessage("The Rift Wyrm awakens! Strike with your forged blade.");
  }
  if (boss.state === "sleeping") return;

  boss.y = surfaceRows[95] * TILE_SIZE - 43 + Math.sin(frameCount * 0.06) * 5;
  if (boss.flash > 0) boss.flash--;

  if (boss.state === "windup") {
    boss.timer--;
    if (boss.timer <= 0) {
      const direction = hero.x < boss.x ? -1 : 1;
      boss.fireball = {
        x: boss.x + direction * 34,
        y: boss.y + 2,
        velocityX: direction * 5,
        velocityY: 0
      };
      boss.state = "attack";
      boss.timer = 100;
    }
  } else if (boss.state === "attack") {
    boss.timer--;
    if (boss.fireball) {
      boss.fireball.x += boss.fireball.velocityX;
      boss.fireball.y += Math.sin(frameCount * 0.14) * 0.7;
      if (
        Math.abs(boss.fireball.x - hero.x) < 23 &&
        Math.abs(boss.fireball.y - hero.y) < 29
      ) {
        hurtHero(18);
        boss.fireball = null;
        boss.state = "idle";
        boss.timer = 65;
      } else if (Math.abs(boss.fireball.x - boss.x) > 560) {
        boss.fireball = null;
      }
    }
    if (boss.timer <= 0) {
      boss.fireball = null;
      boss.state = "idle";
      boss.timer = 65;
    }
  } else if (boss.state === "idle") {
    if (boss.timer > 0) boss.timer--;
    if (boss.timer <= 0 && Math.abs(hero.x - boss.x) < 500) {
      boss.state = "windup";
      boss.timer = 45;
    }
  }
}

function updateCamera() {
  const targetX = constrain(hero.x - width * 0.42, 0, WORLD_WIDTH - width);
  const targetY = constrain(hero.y - height * 0.58, 0, WORLD_HEIGHT - height);
  cameraX = lerp(cameraX, targetX, 0.12);
  cameraY = lerp(cameraY, targetY, 0.12);
}

function drawWorld() {
  push();
  translate(-cameraX, -cameraY);

  noStroke();
  fill("#9dd9f5");
  rect(cameraX, cameraY, width, height);

  const firstColumn = Math.max(0, Math.floor(cameraX / TILE_SIZE) - 1);
  const lastColumn = Math.min(
    WORLD_COLUMNS - 1,
    Math.ceil((cameraX + width) / TILE_SIZE) + 1
  );
  const firstRow = Math.max(0, Math.floor(cameraY / TILE_SIZE) - 1);
  const lastRow = Math.min(
    WORLD_ROWS - 1,
    Math.ceil((cameraY + height) / TILE_SIZE) + 1
  );

  for (let column = firstColumn; column <= lastColumn; column++) {
    for (let row = firstRow; row <= lastRow; row++) {
      const tile = terrain[column][row];
      if (!tile) continue;
      drawTile(column * TILE_SIZE, row * TILE_SIZE, tile);
    }
  }

  drawRift();
  pop();
}

function drawTile(x, y, tile) {
  noStroke();
  fill(TILE_COLORS[tile] || "#777");
  rect(x, y, TILE_SIZE, TILE_SIZE);

  if (tile === "grass") {
    fill("#78c95a");
    rect(x, y, TILE_SIZE, 6);
  } else if (tile === "stone" || tile === "dirt") {
    fill(tile === "stone" ? "#92969c" : "#98653d");
    rect(x + 6, y + 8, 5, 4);
    rect(x + 21, y + 20, 6, 4);
  } else if (tile === "iron") {
    fill("#e0bb9e");
    rect(x + 7, y + 8, 7, 6);
    rect(x + 19, y + 19, 6, 6);
  } else if (tile === "crystal") {
    fill("#b8ffff");
    triangle(x + 16, y + 5, x + 7, y + 23, x + 16, y + 27);
    triangle(x + 16, y + 5, x + 25, y + 23, x + 16, y + 27);
  } else if (tile === "wood") {
    fill("#bd8350");
    rect(x + 7, y, 4, TILE_SIZE);
    rect(x + 21, y, 4, TILE_SIZE);
  } else if (tile === "leaves") {
    fill("#5da74c");
    rect(x + 5, y + 4, 7, 6);
    rect(x + 19, y + 17, 8, 7);
  }

  stroke(0, 0, 0, 22);
  noFill();
  rect(x, y, TILE_SIZE, TILE_SIZE);
  noStroke();
}

function drawRift() {
  const x = boss.x - 50;
  const ground = surfaceRows[95] * TILE_SIZE;
  noStroke();
  fill("#361c54");
  rect(x, ground - 56, 100, 56, 5);
  fill("#bc61f4");
  rect(x + 8, ground - 48, 84, 48, 4);
  fill("#201a45");
  rect(x + 15, ground - 41, 70, 41, 4);
  fill("#fae28a");
  textAlign(CENTER, CENTER);
  textSize(12);
  text(hero.hasBlade ? "RIFT OPEN" : "RIFT SEALED", boss.x, ground - 27);
}

function drawHero() {
  if (invulnerability > 0 && frameCount % 8 < 4) return;
  push();
  translate(hero.x - cameraX, hero.y - cameraY);
  noStroke();
  fill("#342b28");
  rect(-10, -5, 20, 18, 3);
  fill("#f0bd83");
  rect(-8, -15, 16, 13, 3);
  fill("#6b4bb8");
  rect(-10, 1, 20, 12, 2);
  fill("#e8f4ff");
  rect(-5, -11, 3, 3);
  rect(3, -11, 3, 3);
  fill("#3c3048");
  rect(-9, 11, 7, 5);
  rect(2, 11, 7, 5);
  pop();
}

function drawBoss() {
  if (boss.state === "defeated") return;
  const x = boss.x - cameraX;
  const y = boss.y - cameraY;
  const tint = boss.flash > 0 ? "#fff3a1" : "#4b245d";
  noStroke();
  fill("#a24fd0");
  triangle(x - 24, y - 3, x - 76, y - 35, x - 56, y + 17);
  triangle(x + 24, y - 3, x + 76, y - 35, x + 56, y + 17);
  fill(tint);
  ellipse(x, y, 66, 54);
  fill("#2d183c");
  ellipse(x, y + 19, 48, 31);
  fill("#ffd966");
  ellipse(x - 13, y - 6, 9, 8);
  ellipse(x + 13, y - 6, 9, 8);
  fill("#382043");
  triangle(x - 23, y - 22, x - 17, y - 40, x - 8, y - 20);
  triangle(x + 23, y - 22, x + 17, y - 40, x + 8, y - 20);

  if (boss.fireball) {
    fill("#ff833d");
    circle(boss.fireball.x - cameraX, boss.fireball.y - cameraY, 22);
    fill("#ffe17b");
    circle(boss.fireball.x - cameraX, boss.fireball.y - cameraY, 10);
  }
}

function drawDayNight() {
  const cycle = dayTimer / 3600;
  const darkness = (Math.cos(cycle * TWO_PI) + 1) / 2;
  noStroke();
  fill(12, 18, 48, darkness * 105);
  rect(0, 0, width, height);
}

function drawHud() {
  drawPanel(14, 14, 284, 108);
  fill("#fff");
  textAlign(LEFT, TOP);
  textSize(15);
  text("RIFTBOUND", 27, 24);
  textSize(12);
  text("Health", 27, 49);
  drawHealthBar(82, 49, 194, 12);
  text(`Iron ${hero.iron}/5    Crystals ${hero.crystal}/3`, 27, 71);
  text(hero.hasBlade ? "Blade forged — reach the rift!" : "Gather ore, then forge a blade.", 27, 94);

  if (boss.state !== "sleeping" && boss.state !== "defeated") {
    drawPanel(width - 236, 14, 222, 58);
    fill("#fff");
    textAlign(CENTER, TOP);
    textSize(12);
    text("RIFT WYRM", width - 125, 23);
    drawBar(width - 217, 43, 184, 12, boss.health / 100, "#d46bea");
  }

  if (!hero.hasBlade && hero.iron >= 5 && hero.crystal >= 3) {
    forgeButton = { x: width - 190, y: height - 144, w: 176, h: 40 };
    fill("#e1a943");
    stroke("#fff0b0");
    strokeWeight(2);
    rect(forgeButton.x, forgeButton.y, forgeButton.w, forgeButton.h, 7);
    noStroke();
    fill("#271c24");
    textAlign(CENTER, CENTER);
    textSize(13);
    text("FORGE RIFT BLADE", forgeButton.x + forgeButton.w / 2, forgeButton.y + 20);
  } else {
    forgeButton = null;
  }

  const slotSize = 44;
  const gap = 5;
  const totalWidth = slotSize * 9 + gap * 8;
  const startX = Math.max(8, (width - totalWidth) / 2);
  const slotY = height - 64;

  for (let slot = 0; slot < hotbar.length; slot++) {
    const x = startX + slot * (slotSize + gap);
    stroke(slot === selectedSlot ? "#ffe66e" : "#d1d1d1");
    strokeWeight(slot === selectedSlot ? 3 : 1);
    fill(24, 28, 38, 225);
    rect(x, slotY, slotSize, slotSize, 5);
    noStroke();
    drawItemIcon(hotbar[slot].type, x + slotSize / 2, slotY + 20);
    fill("#fff");
    textAlign(LEFT, TOP);
    textSize(9);
    text(`${slot + 1}`, x + 3, slotY + 2);
    const count = itemCount(hotbar[slot].type);
    if (count !== null) {
      textAlign(RIGHT, BOTTOM);
      textSize(10);
      text(`${count}`, x + slotSize - 3, slotY + slotSize - 2);
    }
  }

  fill("#fff");
  textAlign(CENTER, BOTTOM);
  textSize(11);
  text(
    "A/D move   W jump   1–9 select   Pickaxe: mine   Blocks: place   Blade: attack",
    width / 2,
    slotY - 5
  );

  if (messageTimer > 0) {
    fill(22, 24, 35, 220);
    rect(width / 2 - 240, 132, 480, 34, 6);
    fill("#fff1b8");
    textAlign(CENTER, CENTER);
    textSize(12);
    text(message, width / 2, 149);
  }
}

function drawItemIcon(type, x, y) {
  noStroke();
  if (type === "tool") {
    stroke("#d9dce6");
    strokeWeight(4);
    line(x - 7, y + 8, x + 7, y - 8);
    line(x - 8, y - 7, x + 5, y - 7);
    line(x - 7, y - 7, x - 7, y - 2);
    noStroke();
  } else if (type === "sword") {
    stroke("#e6f4ff");
    strokeWeight(4);
    line(x - 7, y + 8, x + 7, y - 8);
    stroke("#d99b55");
    line(x - 7, y, x + 1, y + 7);
    noStroke();
  } else if (TILE_COLORS[type]) {
    fill(TILE_COLORS[type]);
    rect(x - 10, y - 10, 20, 20, 3);
    if (type === "crystal") {
      fill("#d6ffff");
      triangle(x, y - 8, x - 6, y + 6, x, y + 8);
    }
  }
}

function itemCount(type) {
  if (type === "dirt" || type === "stone" || type === "wood") return hero[type];
  if (type === "iron" || type === "crystal") return hero[type];
  if (type === "sword") return hero.hasBlade ? 1 : 0;
  return null;
}

function drawHealthBar(x, y, barWidth, barHeight) {
  drawBar(x, y, barWidth, barHeight, hero.health / 100, "#e65a60");
}

function drawBar(x, y, barWidth, barHeight, amount, color) {
  noStroke();
  fill("#392d36");
  rect(x, y, barWidth, barHeight, 4);
  fill(color);
  rect(x, y, barWidth * constrain(amount, 0, 1), barHeight, 4);
}

function drawPanel(x, y, panelWidth, panelHeight) {
  noStroke();
  fill(24, 28, 38, 220);
  rect(x, y, panelWidth, panelHeight, 8);
}

function drawTitleScreen() {
  fill(9, 14, 26, 170);
  rect(0, 0, width, height);
  drawPanel(width / 2 - 255, height / 2 - 160, 510, 320);
  fill("#f4e3a1");
  textAlign(CENTER, CENTER);
  textSize(32);
  text("RIFTBOUND", width / 2, height / 2 - 110);
  fill("#fff");
  textSize(14);
  text("Mine the glowing surface deposits. Gather 5 iron and 3 crystals.", width / 2, height / 2 - 59);
  text("Click the forge to craft your blade, then defeat the Rift Wyrm.", width / 2, height / 2 - 34);
  text("A / D move     W jump     1–9 choose     Click to mine, place, or strike", width / 2, height / 2 + 2);
  fill("#e1a943");
  rect(width / 2 - 95, height / 2 + 52, 190, 48, 8);
  fill("#221a27");
  textSize(17);
  text("CLICK TO BEGIN", width / 2, height / 2 + 76);
}

function drawEndScreen() {
  fill(9, 14, 26, 190);
  rect(0, 0, width, height);
  drawPanel(width / 2 - 210, height / 2 - 105, 420, 210);
  fill(gameState === "won" ? "#f5df8b" : "#f28b88");
  textAlign(CENTER, CENTER);
  textSize(30);
  text(gameState === "won" ? "THE RIFT IS SEALED!" : "YOU FELL IN BATTLE", width / 2, height / 2 - 39);
  fill("#fff");
  textSize(14);
  text(
    gameState === "won" ? "The valley is safe again." : "Gather your strength and try again.",
    width / 2,
    height / 2 + 4
  );
  text("Press R or click to restart", width / 2, height / 2 + 48);
}

function setMessage(text) {
  message = text;
  messageTimer = 210;
}

function mousePressed() {
  if (gameState === "title") {
    gameState = "playing";
    return false;
  }
  if (gameState === "won" || gameState === "lost") {
    resetGame();
    gameState = "playing";
    return false;
  }

  const slotSize = 44;
  const gap = 5;
  const totalWidth = slotSize * 9 + gap * 8;
  const startX = Math.max(8, (width - totalWidth) / 2);
  const slotY = height - 64;
  if (mouseY >= slotY && mouseY <= slotY + slotSize) {
    for (let slot = 0; slot < 9; slot++) {
      const x = startX + slot * (slotSize + gap);
      if (mouseX >= x && mouseX <= x + slotSize) {
        selectedSlot = slot;
        return false;
      }
    }
  }

  if (
    forgeButton &&
    mouseX >= forgeButton.x &&
    mouseX <= forgeButton.x + forgeButton.w &&
    mouseY >= forgeButton.y &&
    mouseY <= forgeButton.y + forgeButton.h
  ) {
    forgeBlade();
    return false;
  }

  if (mouseButton === RIGHT) {
    mineTarget();
    return false;
  }

  const selected = hotbar[selectedSlot].type;
  if (selected === "sword") attackBoss();
  else if (selected === "dirt" || selected === "stone" || selected === "wood") placeBlock(selected);
  else mineTarget();
  return false;
}

function mineTarget() {
  const worldX = mouseX + cameraX;
  const worldY = mouseY + cameraY;
  const column = Math.floor(worldX / TILE_SIZE);
  const row = Math.floor(worldY / TILE_SIZE);
  if (column < 0 || column >= WORLD_COLUMNS || row < 0 || row >= WORLD_ROWS) return;
  const tile = terrain[column][row];
  if (!tile || dist(hero.x, hero.y, column * TILE_SIZE + 16, row * TILE_SIZE + 16) > 150) return;
  if (tile === "grass" || tile === "dirt") hero.dirt++;
  else if (tile === "stone") hero.stone++;
  else if (tile === "wood") hero.wood++;
  else if (tile === "iron") hero.iron++;
  else if (tile === "crystal") hero.crystal++;
  terrain[column][row] = null;
  if (tile === "iron" || tile === "crystal") {
    setMessage(tile === "iron" ? "Iron ore collected." : "A star crystal collected.");
  }
}

function placeBlock(type) {
  if (hero[type] <= 0) {
    setMessage(`No ${type} blocks left. Mine some first.`);
    return;
  }
  const column = Math.floor((mouseX + cameraX) / TILE_SIZE);
  const row = Math.floor((mouseY + cameraY) / TILE_SIZE);
  if (column < 0 || column >= WORLD_COLUMNS || row < 0 || row >= WORLD_ROWS) return;
  const centerX = column * TILE_SIZE + TILE_SIZE / 2;
  const centerY = row * TILE_SIZE + TILE_SIZE / 2;
  if (
    terrain[column][row] !== null ||
    dist(hero.x, hero.y, centerX, centerY) > 150 ||
    heroTouchesSolid(centerX, centerY)
  ) {
    return;
  }
  terrain[column][row] = type;
  hero[type]--;
}

function forgeBlade() {
  if (hero.hasBlade || hero.iron < 5 || hero.crystal < 3) return;
  hero.iron -= 5;
  hero.crystal -= 3;
  hero.hasBlade = true;
  selectedSlot = 8;
  setMessage("Rift blade forged! The sealed portal lies far to the east.");
}

function attackBoss() {
  if (!hero.hasBlade) {
    setMessage("Forge the Rift Blade before challenging the Wyrm.");
    return;
  }
  if (boss.state === "sleeping" || boss.state === "defeated") return;
  if (Math.abs(hero.x - boss.x) > 112 || Math.abs(hero.y - boss.y) > 78) {
    setMessage("Get closer to the Rift Wyrm to strike.");
    return;
  }
  boss.health = Math.max(0, boss.health - 25);
  boss.flash = 12;
  boss.timer = Math.max(boss.timer, 24);
  if (boss.health === 0) {
    boss.state = "defeated";
    boss.fireball = null;
    gameState = "won";
  } else {
    setMessage("Blade strike! Keep moving to dodge its fire.");
  }
}

function hurtHero(amount) {
  if (invulnerability > 0 || gameState !== "playing") return;
  hero.health = Math.max(0, hero.health - amount);
  invulnerability = 55;
  setMessage("The Wyrm's fire hit you!");
  if (hero.health === 0) gameState = "lost";
}

function keyPressed() {
  if ((key === "w" || key === "W" || keyCode === UP_ARROW) && hero.grounded && gameState === "playing") {
    hero.velocityY = -10.5;
    hero.grounded = false;
  }
  if (key >= "1" && key <= "9") selectedSlot = Number(key) - 1;
  if ((key === "r" || key === "R") && (gameState === "won" || gameState === "lost")) {
    resetGame();
    gameState = "playing";
  }
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
