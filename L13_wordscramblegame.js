let submitbutton
const WORDS=["intentions","Intercontinental","watermelon",
    "nationality","hippopotamus","information", "geometry", 
    "neighboorhood","commentary","broadcasting","transmitting",
    "entertaiment"]

function setup(){
     createCanvas(1400,700);
     background("lightgrey");
     submitbutton=createButton("submit");
     submitbutton.position(width/2+25,400);
     submitbutton.size(200,30);
     submitbutton.style("font-size","20px");
     submitbutton.mousePressed(updateButton); 
}
function draw(){
    textSize(100)
    text("word scramble game",width/2-500,height/2-250)
    textSize(50)
    text("randomword:",width/2-400,height/2-200)
}
function updateButton(){

}