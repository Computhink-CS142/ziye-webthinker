let playerX=100;
let playerY;
let playersize=50;
let velocity=0;
let is_grounded=false;



function setup() {
    createCanvas(1534, 727);
    background("black");
    playerY=height-25
}
function draw(){
    background("black");
    fill("lime");
    rect(500,playerY,50,50);
    fill("white");
    velocity+=0.8
    textSize(32);
    textAlign(CENTER,CENTER)
    text("press                                                    to jump",width/2,50)
}