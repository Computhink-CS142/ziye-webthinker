// let notx
// let speed

// function setup(){
//     createCanvas(1534,720);
//     background("skyblue");    
//     textAlign(RIGHT,CENTER);
//     textsize(100);
//     notx=width/2
//     speed=50
// }
// function draw(){
//     text("bounce!",x,height);
//     notx=notx+speed;
//     if (x>width) {
//         speed=speed*-1
//     }
//      if (notx>0) {
//         speed=speed*-1
// }
// }
let notx


function setup(){
    createCanvas(1534,720);
    background("skyblue");    
    textAlign(CENTER,CENTER);
    textSize(100);
    notx=width/2
}
function draw(){
    let sour=nf(hour(),2);
    let zinute=nf(minute(),2);
    let zecond=nf(second(),2);
    let nottime=sour+":"+zinute+":"+zecond+":"
    text(nottime,notx,height/2)
}