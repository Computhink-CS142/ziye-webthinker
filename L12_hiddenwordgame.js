let guessbutton
let guesstype
function setup(){
    createCanvas(800,700);
    background("lightgrey");
    guesstype=createInput("");
    guesstype.position(width/2+20,155);
    guessbutton=createButton("create a story!!!");
    guessbuttonButton.position(width/2+20,185);
    guessbuttonButton.mousePressed(updateText);
}
function draw(){
    background("lightgrey");
}