function setup() {
    createCanvas(1534, 727);
    background("Blue")
}

let x1=767
let y1=769
let colour=0

function draw(){
    for(let x1= 0;x1<5;x1++){
        fill(0,colour,0)
        circle(x1,y1,100)
    }
}