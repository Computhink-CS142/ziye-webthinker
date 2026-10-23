let playerX=100;
let playerY;
let playersize=50;
let velocity=0;
let is_grounded=false;



function setup() {
    createCanvas(1534, 727);
    background("black");
}
function draw(){
    background("black");
    fill("lime");
    rect(500,height-50,50,50);
    fill("white");
    textSize(32);
    textAlign(CENTER,CENTER)
    text("press to jump",width/2,50)
}