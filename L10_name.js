 let userText="ENTER UR TEXT HERE";
 let input;

 
 function setup(){
    createCanvas(600,600);
     background("skyblue"); 
     input=createInput("");
    input.position(160,530);
    input.input(updateText);
    age.input
 }
 function draw(){
    fill(0);
    background("skyblue");
    textSize(24);
    textAlign(CENTER,CENTER);
    text(userText,width/2,height/2);
    textSize(30);
    textAlign(LEFT);
    text("enter ur username",50,350)
    

 }
 function updateText(){
    userText=this.value();
 }