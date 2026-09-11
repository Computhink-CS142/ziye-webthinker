 let userText="ENTER UR TEXT HERE";
 let input;

 
 function setup(){
    createCanvas(1534,720);
     background("skyblue"); 
     input=createInput("");
    input.position(160,530);
    input.input(updateText);
 }
 function draw(){
    fill(0);
    background("skyblue");
    textSize(24);
    textAlign(CENTER,CENTER);
    text(userText,width/2,height/2);
    textSize(30);
    textAlign(LEFT);
    

 }
 function updateText(){
    userText=this.value();
 }