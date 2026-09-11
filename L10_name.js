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
    textSize(24);
    textAlign(CENTER,CENTER);
    Text(userText,width/2,height/2);

 }
 function updateText(){
    userText=this.value();
 }