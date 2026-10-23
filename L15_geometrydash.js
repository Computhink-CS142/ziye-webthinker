

let playerX = 100;
let playerY;
let playersize = 50;
let velocity = 0;
let is_grounded = false;
let spikesX = [];
let spikeswidth = 20;
let spikesheight = 30;
let spikespeed = 10;

function setup() {
    createCanvas(1534, 727);
    background("black");
    playerY = height - playersize;

    for (let count = 0; count < 3; count++) {
        spikesX.push(width + count * 300);
    }
}

function draw() {
    background("black");

    velocity += 0.8;
    playerY += velocity;

    if (playerY >= height - playersize) {
        playerY = height - playersize;
        is_grounded = true;
        velocity = 0;
    } else {
        is_grounded = false;
    }

    fill("lime");
    rect(playerX, playerY, playersize, playersize);

    textSize(32);
    textAlign(CENTER, CENTER);
    fill("white");
    text("press space to jump", width / 2, 50);

    fill("red");
    for (let count = 0; count < spikesX.length; count++) {
        spikesX[count] -= spikespeed;

        if (spikesX[count] < -spikeswidth) {
            spikesX[count] = width + random(200, 500);
        }

        triangle(
            spikesX[count], height,
            spikesX[count] + spikeswidth / 2, height - spikesheight,
            spikesX[count] + spikeswidth, height
        );
    }
}

function keyPressed() {
    if (keyCode === 32 && is_grounded) {
        velocity = -20;
    }
}