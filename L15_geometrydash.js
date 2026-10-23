

let playerX=100;
let playerY;
let playersize=50;
let velocity=0;
let is_grounded=false;
let spikesX=[];
let spikeswidth=50;
let spikesheight=50;
let spikespeed=10;
let gameover=false;


function setup() {
    createCanvas(1534, 727);
    background("black");
    playerY=height-25

    for(let count=0;count<3;count++){
        spikesX.push(width+count*300)
    }
}
function draw(){
    if (gameover){
        fill("red")
        textSize(44)
    }
    background("black");
    fill("lime");
    rect(500,playerY,50,50);
    fill("white");
    velocity+=0.99;
    playerY+=velocity;
    if (playerY>=height-playersize){
        playerY=height-playersize;
        is_grounded=true;
        velocity=0;
    }else{
        is_grounded=false;
    }
    textSize(32);
    textAlign(CENTER,CENTER)
    text("press                                                    to jump",width/2,50)
    fill("red")
    for(let count=0;count<3;count++){
        spikesX[count]-=spikespeed;

    if (spikesX[count]<0-spikeswidth){
        spikesX[count]=width+random(100,300)

    }
        triangle(spikesX[count],height,
            spikesX[count]+spikeswidth/2,height-spikesheight
            ,spikesX[count]+spikeswidth,height
        );
    }
}
function keyPressed(){
    if (keyCode===32&&is_grounded){
        velocity=-15;
    }
}