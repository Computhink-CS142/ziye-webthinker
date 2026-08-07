let picoImg;
let sounndSFX
function preload(){
    picoImg=loadImage('assets/pico-a.png');
    soundSFX=loadSound(assets/star_wars_theme_8_bit.mp3.png)
}

let x;
let y;

function setup() {
    createCanvas(1534, 727);
    background("Blue");
    // rectMode(CENTER);
    x = width/2;
    y = height/2;
    noStroke();
    image(picoImg,width/2,height/2,110,133);
}
function draw(){
    // background("Blue")
    image(picoImg,x,y,110,133);
    // fill("light blue")

//     rect(x,y,50,50)
    if (keyIsDown(UP_ARROW)){
        y=y-40;
    }        
    else if (keyIsDown(DOWN_ARROW)){
        y=y+40;
    }
    else if (keyIsDown(RIGHT_ARROW)){
        x=x+40;
    }
    else if (keyIsDown(LEFT_ARROW)){
        x=x-40;
    }
    x=constrain(x,0,1500)
    y=constrain(y,0,727)
}
function keyPressed(){
    
}