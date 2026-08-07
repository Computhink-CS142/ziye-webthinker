let picoImg;
function preload(){
    picoImg=loadImage('assets/pico-a.png');
}

// let x;
// let y;

function setup() {
    createCanvas(1534, 727);
    background("Blue")
    // rectMode(CENTER);
    // x = width/2;
    // y = height/2;
    noStroke();
    Image(picoImg,height/2,width/2)
}
// function draw(){
//     background("Blue")

//     fill("lightblue")
//     rect(x,y,50,50)
    
//     if (keyIsDown(UP_ARROW)){
//         y=y-80;
//     }        
//     else if (keyIsDown(DOWN_ARROW)){
//         y=y+80;
//     }
//     else if (keyIsDown(RIGHT_ARROW)){
//         x=x+80;
//     }
//     else if (keyIsDown(LEFT_ARROW)){
//         x=x-80;
//     }
//     x=constrain(x,0,1534)
//     y=constrain(y,0,727)
// }