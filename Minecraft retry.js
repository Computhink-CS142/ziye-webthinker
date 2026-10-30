const TILE = 32;
const COLUMNS = 116;
const ROWS = 26;
const WORLD_PIXEL_WIDTH = COLUMNS * TILE;
const WORLD_PIXEL_HEIGHT = ROWS * TILE;
const STACK_LIMIT = 64;

const BLOCK_COLORS = {
  grass: "#65aa49",
  dirt: "#80532f",
  stone: "#777d86",
  wood: "#a16b3d",
  leaves: "#3d843e",
  iron: "#9b7464",
  crystal: "#62dbe8"
};

const ITEM_LABELS = {
  pickaxe: "Pick",
  dirt: "Dirt",
  stone: "Stone",
  wood: "Wood",
  torch: "Torch",
  iron: "Iron",
  crystal: "Crystal",
  sword: "Blade"
};

let world;
let surfaceRows;
let player;
let playerSprite;
let dragon;
let mobs;
let cameraX = 0;
let cameraY = 0;
let state = "title";
let selectedSlot = 0;
let dayClock = 0;
let hurtTimer = 0;
let swingTimer = 0;
let toast = "";
let toastTimer = 0;
let forgeButton = null;
let lastNight = false;

function setup() {
  new Canvas(windowWidth, windowHeight);
  pixelDensity(1);
  textFont("monospace");
  buildWorld();
  resetGame();
  const canvas = document.querySelector("canvas");
  if (canvas) canvas.addEventListener("contextmenu", (event) => event.preventDefault());
}

function buildWorld() {
  world = Array.from({ length: COLUMNS }, () => Array(ROWS).fill(null));
  surfaceRows = [];

  for (let column = 0; column < COLUMNS; column++) {
    const surface = constrain(
      Math.floor(12 + Math.sin(column * 0.18) * 1.2 + Math.sin(column * 0.061) * 1.1),
      9,
      15
    );
    surfaceRows[column] = surface;
    for (let row = surface; row < ROWS; row++) {
      world[column][row] = row === surface ? "grass" : row < surface + 4 ? "dirt" : "stone";
    }
  }

  for (const column of [8, 17, 26, 35, 46, 58, 70]) {
    world[column][surfaceRows[column] + 1] = "iron";
  }
  for (const column of [13, 30, 43, 61, 78, 91]) {
    world[column][surfaceRows[column] + 2] = "crystal";
  }

  for (const column of [5, 23, 39, 55, 74, 88]) {
    if (column > COLUMNS - 10) continue;
    const ground = surfaceRows[column];
    for (let row = ground - 1; row >= ground - 3; row--) world[column][row] = "wood";
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -5; dy <= -3; dy++) {
        const x = column + dx;
        const y = ground + dy;
        if (x >= 0 && x < COLUMNS && world[x][y] === null) world[x][y] = "leaves";
      }
    }
  }
}

function resetGame() {
  const startX = TILE * 3;
  const groundY = surfaceRows[3] * TILE;
  player = {
    x: startX,
    y: groundY - 15,
    vx: 0,
    vy: 0,
    width: 22,
    height: 30,
    health: 100,
    grounded: false,
    facing: 1,
    inventory: [
      { type: "pickaxe", count: 1 },
      { type: "dirt", count: 12 },
      { type: "wood", count: 4 },
      { type: "torch", count: 6 },
      null, null, null, null, null
    ]
  };
  if (!playerSprite) {
    playerSprite = new Sprite(player.x, player.y, player.width, player.height);
    playerSprite.physics = "none";
    playerSprite.visible = false;
  } else {
    playerSprite.x = player.x;
    playerSprite.y = player.y;
  }

  const dragonX = (COLUMNS - 5) * TILE;
  dragon = {
    x: dragonX,
    y: surfaceRows[COLUMNS - 5] * TILE - 54,
    homeX: dragonX,
    health: 120,
    state: "sleeping",
    timer: 0,
    fireball: null,
    flash: 0,
    targetX: dragonX,
    defeated: false
  };
  mobs = [18, 40, 63, 83].map((column, index) => ({
    x: column * TILE,
    y: surfaceRows[column] * TILE - 13,
    vx: index % 2 ? -0.5 : 0.5,
    health: 30,
    alive: true,
    phase: index
  }));
  cameraX = 0;
  cameraY = 0;
  selectedSlot = 0;
  dayClock = 0;
  hurtTimer = 0;
  swingTimer = 0;
  toast = "";
  toastTimer = 0;
  forgeButton = null;
  lastNight = false;
  state = "title";
}

function update() {
  drawSky();
  if (state === "title") {
    drawScene();
    drawHud();
    drawTitle();
    return;
  }
  if (state === "won" || state === "lost") {
    drawScene();
    drawHud();
    drawEndScreen();
    return;
  }

  dayClock = (dayClock + 1) % 3600;
  const night = isNight();
  if (night && !lastNight) showMessage("Night falls. Slimes are out after dark.");
  lastNight = night;
  if (hurtTimer > 0) hurtTimer--;
  if (swingTimer > 0) swingTimer--;
  if (toastTimer > 0) toastTimer--;

  updatePlayer();
  updateMobs();
  updateDragon();
  updateCamera();

  drawScene();
  drawMobs();
  drawDragon();
  drawPlayer();
  drawNightOverlay();
  drawHud();
}

function isNight() {
  return dayClock > 1900 && dayClock < 3100;
}

function updatePlayer() {
  const slow = keyIsDown(83) ? 0.55 : 1;
  player.vx = 0;
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) player.vx -= 3.3 * slow;
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) player.vx += 3.3 * slow;
  if (player.vx !== 0) player.facing = Math.sign(player.vx);

  const nextX = constrain(player.x + player.vx, player.width / 2, WORLD_PIXEL_WIDTH - player.width / 2);
  if (!touchesSolid(nextX, player.y)) player.x = nextX;

  player.vy = Math.min(player.vy + 0.56, 12);
  const nextY = player.y + player.vy;
  if (!touchesSolid(player.x, nextY)) {
    player.y = nextY;
    player.grounded = false;
  } else {
    if (player.vy > 0) {
      const bottomRow = Math.floor((nextY + player.height / 2 - 2) / TILE);
      player.y = bottomRow * TILE - player.height / 2 + 2 - 0.01;
      player.grounded = true;
    } else if (player.vy < 0) {
      const topRow = Math.floor((nextY - player.height / 2 + 2) / TILE);
      player.y = (topRow + 1) * TILE + player.height / 2 - 2 + 0.01;
      player.grounded = false;
    }
    player.vy = 0;
  }

  if (player.y > WORLD_PIXEL_HEIGHT + 40) player.health = 0;
  if (player.health <= 0) state = "lost";
  playerSprite.x = player.x;
  playerSprite.y = player.y;
}

function touchesSolid(centerX, centerY) {
  const left = centerX - player.width / 2 + 2;
  const right = centerX + player.width / 2 - 2;
  const top = centerY - player.height / 2 + 2;
  const bottom = centerY + player.height / 2 - 2;
  return isSolidAt(left, top) || isSolidAt(right, top) ||
    isSolidAt(left, bottom) || isSolidAt(right, bottom);
}

function isSolidAt(worldX, worldY) {
  if (worldX < 0 || worldX >= WORLD_PIXEL_WIDTH || worldY >= WORLD_PIXEL_HEIGHT) return true;
  if (worldY < 0) return false;
  return world[Math.floor(worldX / TILE)][Math.floor(worldY / TILE)] !== null;
}

function updateMobs() {
  for (const mob of mobs) {
    if (!mob.alive) continue;
    const surfaceY = surfaceRows[Math.floor(mob.x / TILE)] * TILE - 13;
    mob.y = surfaceY + Math.sin(frameCount * 0.12 + mob.phase) * 2;
    if (isNight() && Math.abs(player.x - mob.x) < 280) {
      mob.vx = Math.sign(player.x - mob.x) * 0.72;
    } else if (frameCount % 90 === mob.phase * 9) {
      mob.vx *= -1;
    }
    const nextX = mob.x + mob.vx;
    const col = constrain(Math.floor(nextX / TILE), 1, COLUMNS - 2);
    if (world[col][surfaceRows[col] - 1] === null) mob.x = nextX;
    if (isNight() && Math.abs(player.x - mob.x) < 26 && Math.abs(player.y - mob.y) < 30) {
      hurtPlayer(8);
      mob.vx = player.x < mob.x ? 1.8 : -1.8;
    }
  }
}

function updateDragon() {
  if (dragon.state === "defeated") return;
  if (dragon.state === "sleeping") {
    if (Math.abs(player.x - dragon.x) < 540) {
      dragon.state = "idle";
      dragon.timer = 65;
      showMessage("The Ender Dragon awakens! Use your forged blade.");
    }
    return;
  }
  if (dragon.flash > 0) dragon.flash--;
  dragon.y = surfaceRows[COLUMNS - 5] * TILE - 54 + Math.sin(frameCount * 0.055) * 9;

  if (dragon.state === "windup") {
    dragon.timer--;
    if (dragon.timer <= 0) {
      const direction = player.x < dragon.x ? -1 : 1;
      dragon.fireball = {
        x: dragon.x + direction * 34,
        y: dragon.y + 7,
        vx: direction * 4.1,
        vy: constrain((player.y - dragon.y) / 90, -1.2, 1.2)
      };
      dragon.state = "attack";
      dragon.timer = 90;
    }
  } else if (dragon.state === "attack") {
    dragon.timer--;
    if (dragon.fireball) {
      dragon.fireball.x += dragon.fireball.vx;
      dragon.fireball.y += dragon.fireball.vy + Math.sin(frameCount * 0.1) * 0.25;
      if (Math.abs(dragon.fireball.x - player.x) < 25 &&
          Math.abs(dragon.fireball.y - player.y) < 27) {
        hurtPlayer(18);
        dragon.fireball = null;
      } else if (Math.abs(dragon.fireball.x - dragon.x) > 720) {
        dragon.fireball = null;
      }
    }
    if (dragon.timer <= 0) {
      dragon.fireball = null;
      dragon.state = "reposition";
      dragon.targetX = constrain(
        player.x + (dragon.x < player.x ? -170 : 170),
        WORLD_PIXEL_WIDTH - 740,
        WORLD_PIXEL_WIDTH - 110
      );
      dragon.timer = 75;
    }
  } else if (dragon.state === "reposition") {
    dragon.x += constrain(dragon.targetX - dragon.x, -2.6, 2.6);
    dragon.timer--;
    if (dragon.timer <= 0 || Math.abs(dragon.targetX - dragon.x) < 8) {
      dragon.state = "idle";
      dragon.timer = 55;
    }
  } else if (dragon.state === "idle") {
    dragon.timer--;
    if (dragon.timer <= 0) {
      dragon.state = "windup";
      dragon.timer = 42;
    }
  }
}

function updateCamera() {
  const targetX = constrain(player.x - width * 0.42, 0, Math.max(0, WORLD_PIXEL_WIDTH - width));
  const targetY = constrain(player.y - height * 0.58, 0, Math.max(0, WORLD_PIXEL_HEIGHT - height));
  cameraX = lerp(cameraX, targetX, 0.12);
  cameraY = lerp(cameraY, targetY, 0.12);
}

function drawSky() {
  const phase = dayClock / 3600;
  const darkness = (Math.cos(phase * TWO_PI) + 1) / 2;
  background(lerpColor(color("#74c9f0"), color("#182344"), darkness * 0.72));
}

function drawScene() {
  push();
  translate(-cameraX, -cameraY);
  const firstCol = Math.max(0, Math.floor(cameraX / TILE) - 1);
  const lastCol = Math.min(COLUMNS - 1, Math.ceil((cameraX + width) / TILE) + 1);
  const firstRow = Math.max(0, Math.floor(cameraY / TILE) - 1);
  const lastRow = Math.min(ROWS - 1, Math.ceil((cameraY + height) / TILE) + 1);

  noStroke();
  fill("#88d0f0");
  rect(cameraX, cameraY, width, height);
  drawPortal();
  for (let col = firstCol; col <= lastCol; col++) {
    for (let row = firstRow; row <= lastRow; row++) {
      const block = world[col][row];
      if (block) drawBlock(col * TILE, row * TILE, block);
    }
  }
  pop();
}

function drawBlock(x, y, block) {
  noStroke();
  fill(BLOCK_COLORS[block] || "#777");
  rect(x, y, TILE, TILE);
  if (block === "grass") {
    fill("#83ce59");
    rect(x, y, TILE, 6);
  } else if (block === "dirt" || block === "stone") {
    fill(block === "dirt" ? "#9a6940" : "#969ba2");
    rect(x + 6, y + 8, 5, 4);
    rect(x + 21, y + 20, 6, 4);
  } else if (block === "iron") {
    fill("#e6c6b0");
    rect(x + 6, y + 8, 8, 6);
    rect(x + 20, y + 20, 6, 6);
  } else if (block === "crystal") {
    fill("#c8ffff");
    triangle(x + 16, y + 4, x + 7, y + 25, x + 16, y + 29);
    triangle(x + 16, y + 4, x + 25, y + 25, x + 16, y + 29);
  } else if (block === "wood") {
    fill("#c08a54");
    rect(x + 7, y, 4, TILE);
    rect(x + 21, y, 4, TILE);
  } else if (block === "leaves") {
    fill("#62a94a");
    rect(x + 5, y + 4, 8, 7);
    rect(x + 19, y + 18, 8, 8);
  }
  stroke(0, 0, 0, 24);
  noFill();
  rect(x, y, TILE, TILE);
  noStroke();
}

function drawPortal() {
  const ground = surfaceRows[COLUMNS - 5] * TILE;
  const x = dragon.homeX - 55;
  noStroke();
  fill("#241632");
  rect(x, ground - 70, 110, 70, 8);
  fill("#9d42ca");
  rect(x + 9, ground - 61, 92, 61, 5);
  fill("#242043");
  rect(x + 18, ground - 52, 74, 52, 4);
  fill("#fff0b0");
  textAlign(CENTER, CENTER);
  textSize(11);
  text("THE END", x + 55, ground - 29);
}

function drawPlayer() {
  if (hurtTimer > 0 && frameCount % 8 < 4) return;
  push();
  translate(player.x - cameraX, player.y - cameraY);
  noStroke();
  fill("#342b28");
  rect(-10, -5, 20, 18, 3);
  fill("#edbd83");
  rect(-8, -15, 16, 13, 3);
  fill("#3284a3");
  rect(-10, 1, 20, 12, 2);
  fill("#f7ffff");
  rect(player.facing > 0 ? 2 : -5, -11, 3, 3);
  fill("#353047");
  rect(-9, 11, 7, 5);
  rect(2, 11, 7, 5);
  if (swingTimer > 0) {
    stroke("#fff2a1");
    strokeWeight(4);
    line(7 * player.facing, -1, 25 * player.facing, -14);
  }
  pop();
}

function drawMobs() {
  for (const mob of mobs) {
    if (!mob.alive) continue;
    const x = mob.x - cameraX;
    const y = mob.y - cameraY;
    noStroke();
    fill(isNight() ? "#8f57bd" : "#54885b");
    rect(x - 15, y - 10, 30, 20, 7, 7, 3, 3);
    fill("#f8f2d4");
    rect(x - 7, y - 5, 4, 4);
    rect(x + 4, y - 5, 4, 4);
  }
}

function drawDragon() {
  if (dragon.state === "defeated") return;
  const x = dragon.x - cameraX;
  const y = dragon.y - cameraY;
  const flap = Math.sin(frameCount * 0.15) * 12;
  noStroke();
  fill("#7335a5");
  triangle(x - 23, y - 4, x - 77, y - 39 - flap, x - 55, y + 18);
  triangle(x + 23, y - 4, x + 77, y - 39 + flap, x + 55, y + 18);
  fill(dragon.flash > 0 ? "#fff0a8" : "#342348");
  ellipse(x, y, 67, 52);
  fill("#251932");
  ellipse(x, y + 20, 47, 28);
  fill("#ffe46f");
  ellipse(x - 13, y - 5, 9, 8);
  ellipse(x + 13, y - 5, 9, 8);
  fill("#472451");
  triangle(x - 24, y - 20, x - 18, y - 41, x - 8, y - 20);
  triangle(x + 24, y - 20, x + 18, y - 41, x + 8, y - 20);
  if (dragon.fireball) {
    fill("#ff743d");
    circle(dragon.fireball.x - cameraX, dragon.fireball.y - cameraY, 24);
    fill("#ffe280");
    circle(dragon.fireball.x - cameraX, dragon.fireball.y - cameraY, 10);
  }
}

function drawNightOverlay() {
  const progress = dayClock / 3600;
  const darkness = Math.max(0, (Math.cos(progress * TWO_PI) + 1) / 2 - 0.55);
  noStroke();
  fill(12, 15, 42, darkness * 115);
  rect(0, 0, width, height);
}

function drawHud() {
  drawPanel(12, 12, Math.min(310, width - 24), 102);
  const counts = countInventory();
  fill("#fff");
  textAlign(LEFT, TOP);
  textSize(15);
  text("MINECRAFT2.0", 25, 21);
  textSize(11);
  text("Health", 25, 46);
  drawBar(79, 47, Math.min(207, width - 115), 11, player.health / 100, "#e65a60");
  text(`Iron ${counts.iron} / 5     Crystals ${counts.crystal} / 3`, 25, 66);
  text(playerHasSword() ? "Blade ready — reach the portal!" : "Gather ore, then forge a blade.", 25, 86);

  if (dragon.state !== "sleeping" && dragon.state !== "defeated") {
    const panelWidth = Math.min(260, width - 32);
    const x = width - panelWidth - 14;
    const y = width < 600 ? 122 : 14;
    drawPanel(x, y, panelWidth, 54);
    fill("#fff");
    textAlign(CENTER, TOP);
    textSize(12);
    text("ENDER DRAGON", x + panelWidth / 2, y + 8);
    drawBar(x + 18, y + 30, panelWidth - 36, 11, dragon.health / 120, "#be67e2");
  }

  const hasMaterials = counts.iron >= 5 && counts.crystal >= 3;
  if (!playerHasSword() && hasMaterials) {
    forgeButton = { x: width - 188, y: height - 122, w: 174, h: 38 };
    fill("#e7b64f");
    stroke("#fff1b7");
    strokeWeight(2);
    rect(forgeButton.x, forgeButton.y, forgeButton.w, forgeButton.h, 7);
    noStroke();
    fill("#261c27");
    textAlign(CENTER, CENTER);
    textSize(12);
    text("FORGE ENDER BLADE", forgeButton.x + forgeButton.w / 2, forgeButton.y + 19);
  } else {
    forgeButton = null;
  }

  drawHotbar();
  if (toastTimer > 0) {
    const toastWidth = Math.min(500, width - 28);
    fill(20, 23, 35, 225);
    rect(width / 2 - toastWidth / 2, width < 600 && dragon.state !== "sleeping" ? 184 : 122, toastWidth, 32, 6);
    fill("#fff0b2");
    textAlign(CENTER, CENTER);
    textSize(width < 420 ? 9 : 11);
    text(toast, width / 2, width < 600 && dragon.state !== "sleeping" ? 200 : 138);
  }
}

function drawHotbar() {
  const layout = hotbarLayout();
  for (let index = 0; index < player.inventory.length; index++) {
    const x = layout.startX + index * (layout.slotSize + layout.gap);
    stroke(index === selectedSlot ? "#ffe66e" : "#d0d4dd");
    strokeWeight(index === selectedSlot ? 3 : 1);
    fill(24, 28, 38, 230);
    rect(x, layout.y, layout.slotSize, layout.slotSize, 5);
    const item = player.inventory[index];
    noStroke();
    if (item) {
      drawItemIcon(item.type, x + layout.slotSize / 2, layout.y + 18, layout.slotSize);
      fill("#fff");
      textAlign(LEFT, TOP);
      textSize(8);
      text(String(index + 1), x + 3, layout.y + 2);
      if (item.type !== "pickaxe" && item.type !== "sword") {
        textAlign(RIGHT, BOTTOM);
        textSize(9);
        text(String(item.count), x + layout.slotSize - 3, layout.y + layout.slotSize - 2);
      }
    } else {
      fill("#aeb6c4");
      textAlign(LEFT, TOP);
      textSize(8);
      text(String(index + 1), x + 3, layout.y + 2);
    }
  }
  fill("#fff");
  textAlign(CENTER, BOTTOM);
  textSize(width < 520 ? 9 : 11);
  text(
    "A/D move   W jump   1–9 select   Click mine/attack   Right-click place",
    width / 2,
    layout.y - 7
  );
}

function drawItemIcon(type, x, y, size) {
  noStroke();
  if (type === "pickaxe" || type === "sword") {
    stroke(type === "sword" ? "#f2fbff" : "#d9dce6");
    strokeWeight(3);
    line(x - 6, y + 7, x + 7, y - 7);
    if (type === "sword") {
      stroke("#dba75d");
      line(x - 7, y, x + 2, y + 7);
    } else {
      line(x - 8, y - 6, x + 5, y - 6);
    }
  } else {
    fill(BLOCK_COLORS[type] || (type === "torch" ? "#ffbd56" : "#777"));
    rect(x - size * 0.23, y - size * 0.23, size * 0.46, size * 0.46, 3);
    if (type === "crystal") {
      fill("#d8ffff");
      triangle(x, y - 8, x - 5, y + 6, x, y + 8);
    } else if (type === "torch") {
      fill("#fff3a1");
      circle(x, y - 4, 6);
    }
  }
  noStroke();
}

function hotbarLayout() {
  const gap = width < 480 ? 3 : 5;
  const slotSize = Math.min(44, (width - 16 - gap * 8) / 9);
  const total = slotSize * 9 + gap * 8;
  return {
    slotSize,
    gap,
    startX: Math.max(8, (width - total) / 2),
    y: height - slotSize - 14
  };
}

function drawBar(x, y, w, h, fraction, fillColor) {
  noStroke();
  fill("#392d36");
  rect(x, y, w, h, 4);
  fill(fillColor);
  rect(x, y, w * constrain(fraction, 0, 1), h, 4);
}

function drawPanel(x, y, w, h) {
  noStroke();
  fill(24, 28, 38, 225);
  rect(x, y, w, h, 8);
}

function drawTitle() {
  fill(7, 12, 25, 170);
  rect(0, 0, width, height);
  const w = Math.min(520, width - 24);
  const x = (width - w) / 2;
  const y = Math.max(20, height / 2 - 170);
  drawPanel(x, y, w, 340);
  fill("#f6e39c");
  textAlign(CENTER, CENTER);
  textSize(width < 520 ? 27 : 36);
  text("MINECRAFT2.0", width / 2, y + 48);
  fill("#fff");
  textSize(width < 520 ? 10 : 13);
  text("Mine for iron and crystals, forge a blade, and face the Ender Dragon.", width / 2, y + 101);
  text("A / D move     W jump     S crouch     1–9 select hotbar", width / 2, y + 136);
  text("Left-click mine or attack     Right-click place a block", width / 2, y + 161);
  text("Collect 5 iron and 3 crystals to craft your Ender Blade.", width / 2, y + 194);
  fill("#e5b34d");
  rect(width / 2 - 105, y + 236, 210, 48, 8);
  fill("#241a24");
  textSize(16);
  text("CLICK TO PLAY", width / 2, y + 260);
}

function drawEndScreen() {
  fill(8, 12, 25, 190);
  rect(0, 0, width, height);
  const w = Math.min(440, width - 28);
  drawPanel((width - w) / 2, height / 2 - 112, w, 224);
  fill(state === "won" ? "#f5df8b" : "#f28b88");
  textAlign(CENTER, CENTER);
  textSize(width < 480 ? 23 : 30);
  text(state === "won" ? "THE DRAGON IS DEFEATED!" : "YOU FELL IN BATTLE", width / 2, height / 2 - 43);
  fill("#fff");
  textSize(13);
  text(state === "won" ? "The End is yours to explore." : "Gather your strength and try again.", width / 2, height / 2 + 3);
  text("Press R or click to restart", width / 2, height / 2 + 48);
}

function countInventory() {
  const counts = { iron: 0, crystal: 0 };
  for (const item of player.inventory) {
    if (item && (item.type === "iron" || item.type === "crystal")) counts[item.type] += item.count;
  }
  return counts;
}

function playerHasSword() {
  return player.inventory.some((item) => item && item.type === "sword");
}

function insertItem(type, amount = 1) {
  let remaining = amount;
  const stackLimit = type === "pickaxe" || type === "sword" ? 1 : STACK_LIMIT;
  for (const item of player.inventory) {
    if (item && item.type === type && item.count < stackLimit) {
      const moved = Math.min(stackLimit - item.count, remaining);
      item.count += moved;
      remaining -= moved;
      if (remaining === 0) return true;
    }
  }
  while (remaining > 0) {
    const emptyIndex = player.inventory.findIndex((item) => item === null);
    if (emptyIndex === -1) return false;
    const moved = Math.min(stackLimit, remaining);
    player.inventory[emptyIndex] = { type, count: moved };
    remaining -= moved;
  }
  return true;
}

function removeFromSlot(index, amount = 1) {
  const item = player.inventory[index];
  if (!item || item.count < amount) return false;
  item.count -= amount;
  if (item.count === 0) player.inventory[index] = null;
  return true;
}

function showMessage(message) {
  toast = message;
  toastTimer = 190;
}

function hurtPlayer(amount) {
  if (hurtTimer > 0 || state !== "playing") return;
  player.health = Math.max(0, player.health - amount);
  hurtTimer = 65;
  if (player.health <= 0) state = "lost";
}

function targetTile() {
  const worldX = mouseX + cameraX;
  const worldY = mouseY + cameraY;
  const col = Math.floor(worldX / TILE);
  const row = Math.floor(worldY / TILE);
  if (col < 0 || col >= COLUMNS || row < 0 || row >= ROWS) return null;
  const centerX = col * TILE + TILE / 2;
  const centerY = row * TILE + TILE / 2;
  if (dist(player.x, player.y, centerX, centerY) > 160) return null;
  return { col, row, centerX, centerY, block: world[col][row] };
}

function mineTarget() {
  const target = targetTile();
  if (!target) {
    showMessage("That block is out of reach.");
    return;
  }
  if (!target.block) {
    showMessage("There is no block there to mine.");
    return;
  }
  const drop = target.block === "grass" ? "dirt"
    : target.block === "leaves" ? null
      : target.block;
  if (drop && !insertItem(drop)) {
    showMessage("Inventory full. Make room before mining.");
    return;
  }
  world[target.col][target.row] = null;
  if (drop === "iron" || drop === "crystal") {
    showMessage(`${ITEM_LABELS[drop]} collected.`);
  }
}

function placeSelectedBlock() {
  const item = player.inventory[selectedSlot];
  if (!item || !["dirt", "stone", "wood"].includes(item.type)) {
    showMessage("Select a block stack before placing.");
    return;
  }
  const target = targetTile();
  if (!target) {
    showMessage("That spot is out of reach.");
    return;
  }
  if (target.block) {
    showMessage("That space is already occupied.");
    return;
  }
  const overlapsPlayer =
    Math.abs(target.centerX - player.x) < (TILE + player.width) / 2 &&
    Math.abs(target.centerY - player.y) < (TILE + player.height) / 2;
  if (overlapsPlayer) {
    showMessage("You cannot place a block inside yourself.");
    return;
  }
  world[target.col][target.row] = item.type;
  removeFromSlot(selectedSlot);
}

function attackTarget() {
  const selected = player.inventory[selectedSlot];
  if (!selected || selected.type !== "sword") {
    showMessage("Select your Ender Blade to attack.");
    return;
  }
  swingTimer = 12;
  let hit = false;
  for (const mob of mobs) {
    if (mob.alive && dist(player.x, player.y, mob.x, mob.y) < 54) {
      mob.health -= 30;
      mob.x += player.facing * 12;
      if (mob.health <= 0) {
        mob.alive = false;
        insertItem("crystal", 1);
      }
      hit = true;
    }
  }
  if (dragon.state !== "sleeping" && dragon.state !== "defeated" &&
      Math.abs(player.x - dragon.x) < 145 && Math.abs(player.y - dragon.y) < 95) {
    dragon.health = Math.max(0, dragon.health - 20);
    dragon.flash = 9;
    hit = true;
    if (dragon.health <= 0) {
      dragon.state = "defeated";
      showMessage("The Ender Dragon has been defeated!");
      state = "won";
    }
  }
  if (!hit) showMessage("Move closer to an enemy or the dragon to strike.");
}

function forgeSword() {
  if (playerHasSword()) return;
  const counts = countInventory();
  if (counts.iron < 5 || counts.crystal < 3) {
    showMessage("You need 5 iron and 3 crystals to forge the blade.");
    return;
  }
  const emptyIndex = player.inventory.findIndex((item) => item === null);
  if (emptyIndex === -1) {
    showMessage("Inventory full. Make a free slot before forging.");
    return;
  }
  removeItems("iron", 5);
  removeItems("crystal", 3);
  player.inventory[emptyIndex] = { type: "sword", count: 1 };
  selectedSlot = emptyIndex;
  showMessage("Ender Blade forged! Travel east to the portal.");
}

function removeItems(type, amount) {
  let remaining = amount;
  for (let index = 0; index < player.inventory.length && remaining > 0; index++) {
    const item = player.inventory[index];
    if (!item || item.type !== type) continue;
    const removed = Math.min(item.count, remaining);
    removeFromSlot(index, removed);
    remaining -= removed;
  }
}

function mousePressed() {
  if (state === "title") {
    state = "playing";
    return false;
  }
  if (state === "won" || state === "lost") {
    resetGame();
    state = "playing";
    return false;
  }

  const layout = hotbarLayout();
  if (mouseY >= layout.y && mouseY <= layout.y + layout.slotSize) {
    for (let index = 0; index < 9; index++) {
      const x = layout.startX + index * (layout.slotSize + layout.gap);
      if (mouseX >= x && mouseX <= x + layout.slotSize) {
        selectedSlot = index;
        return false;
      }
    }
  }
  if (forgeButton && mouseX >= forgeButton.x && mouseX <= forgeButton.x + forgeButton.w &&
      mouseY >= forgeButton.y && mouseY <= forgeButton.y + forgeButton.h) {
    forgeSword();
    return false;
  }
  if (mouseButton === RIGHT) {
    placeSelectedBlock();
    return false;
  }
  if (player.inventory[selectedSlot] && player.inventory[selectedSlot].type === "sword") {
    attackTarget();
  } else {
    mineTarget();
  }
  return false;
}

function keyPressed() {
  if (state === "title") {
    state = "playing";
    if (keyCode >= 49 && keyCode <= 57) selectedSlot = keyCode - 49;
    return false;
  }
  if ((state === "won" || state === "lost") && (key === "r" || key === "R" || key === " ")) {
    resetGame();
    state = "playing";
    return false;
  }
  if (keyCode >= 49 && keyCode <= 57) selectedSlot = keyCode - 49;
  if ((key === "w" || key === "W" || keyCode === UP_ARROW) && player.grounded && state === "playing") {
    player.vy = -9.5;
    player.grounded = false;
    return false;
  }
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateCamera();
}
