let guessbutton
let guesstype
function setup(){
    createCanvas(800,700);
    background("lightgrey");
    guesstype=createInput("");
    guesstype.position(300,200);
    guessbutton=createButton("?guess?");
    guessbutton.position(width/2+20,200);
    guessbutton.mousePressed(updateText);
}
function draw(){
    background("lightgrey");
}
function updateText(){

}