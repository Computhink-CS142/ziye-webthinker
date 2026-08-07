function setup() {
    createCanvas(1534, 727);
    background("Blue")
    rectMode(CENTER)
}
function draw(){
    fill("lightblue")
    rect(width/2,height/2,50,50)
    x=constrain(x,0,1534)
    y=constrain(y,0,727)
    if (keyIsDown(UP_ARROW))
        Y=Y+5
    else if (keyIsDown(DOWN_ARROW))
        Y=Y-5
    else if (keyIsDown(RIGHT_ARROW))
        X=X+5
    else if (keyIsDown(LEFT_ARROW))
        X=X-5
}