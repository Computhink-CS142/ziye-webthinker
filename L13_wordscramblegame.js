let submitbutton
let rescramblebutton
let guessInput
let hiddenword
const WORDS=["intentions","Intercontinental","watermelon",
    "nationality","hippopotamus","information", "geometry", 
    "neighboorhood","commentary","broadcasting","transmitting",
    "entertaiment"]

function setup(){
     createCanvas(1400,700);
     background("lightgrey");
     submitbutton=createButton("submit");
     submitbutton.position(width/2+125,400);
     submitbutton.size(200,30);
     submitbutton.style("font-size","20px");
     submitbutton.mousePressed(updateButton); 
    rescramblebutton=createButton("rescramble");
     rescramblebutton.position(width/2-500,400);
     rescramblebutton.size(200,30);
     rescramblebutton.style("font-size","20px");
     rescramblebutton.mousePressed(updateButton); 
     guessInput=createInput("");
     guessInput.size(300,30);
     guessInput.style("font-size","20px")
     guessInput.position(500,400);
}
function draw(){
    textSize(100)
    text("word scramble game",width/2-500,height/2-250)
    textSize(50)
    text("randomword:",width/2-400,height/2-200)
    text("score:0",width/2-150,height/2+200)
    text("streak:0",width/2-150,height/2+250)
}
function updateButton(){

}