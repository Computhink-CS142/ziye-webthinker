function setup() {
    createCanvas(1534, 727);
    background("Blue")
}

// let x1=767
// let y1=369
// let colour=0

// function draw(){
//     for(let x1= 0;x1<5;x1++){
//         fill(0,colour,0)
//         circle(x1,y1,35 )
//         x1+=50
//         y1+=50
//         colour+=50
//     }
// }

function draw(){
    circle(767,361,500)
    function mouseReleased(){
        shapeColor=color(random(255),random(255),random(255));
    }
}






