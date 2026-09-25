let guessbutton
let guesstype
function setup(){
    createCanvas(800,700);
    background("lightgrey");
    place=createInput("");
    place.position(width/2+20,155);
    guessbutton=createButton("create a story!!!");
    storyButton.position(width/2+20,185);
    storyButton.mousePressed(updateText);
}
function draw(){
    background("lightgrey");
}