let guessbutton
let guesstype
function setup(){
    createCanvas(800,700);
    background("lightgrey");
    guesstype=createInput("");
    guesstype.position(300,200);
    guessbutton=createButton("?guess?");
    guessbutton.position(width/2+100,200);
    guessbutton.mousePressed(updateText);
}
function draw(){
    background("lightgrey");
    text("GUESS THE HIDDEN WORD!",0,200)
    textSize(70)
}
function updateText(){

}