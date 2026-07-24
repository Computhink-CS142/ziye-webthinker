function setup() {
    createCanvas(1534, 727);
    background("Blue")
    nostrok
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
// shapeColor=0
// function draw(){
//     fill(shapeColor)
//     circle(767,361,500)
    
// }
// function mousePressed(){
//         shapeColor=color(random(255),random(255),random(255));
//     }

// function mouseReleased(){
//         shapeColor=color(255);
//     }
// function mouseragged(){
//     ellipse(mouseX,mouseY,50,50)
// }

function mouseDragged(){
    fill(random(255),random(255),random(255));
    ellipse(mouseX,mouseY,50,50)

}


