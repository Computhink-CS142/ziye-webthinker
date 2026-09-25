let guessbutton
let guesstype
let atmpt=0
let hints
function setup(){
    createCanvas(1000,700);
    background("lightgrey");
    guesstype=createInput("");
    guesstype.position(300,400);
    guessbutton=createButton("?guess?");
    guessbutton.position(width/2+25,400);
    guessbutton.mousePressed(updateButton);
}
function draw(){
    background("lightgrey");
    text("GUESS THE HIDDEN WORD!",0,150)
    textSize(70)
    text("Attempts:"+atmpt,200,250)
    textSize
}
function updateButton(){
    print("hello")
    atmpt++
}