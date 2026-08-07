function setup() {
    createCanvas(1534, 727);
    background("Blue")
    rectMode(CENTER)
}
function draw(){
    fill("lightblue")
    rect(width/2,height/2,50,50)
    x=constrain(x,y,1534,727)
    y=constrain(y,0,727)

}