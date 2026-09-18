let userText="";
let input;
let ageinput;
let colorPicker
let colorPicker3
 
 function setup(){
    colorPicker2=createColorPicker("#ffffff");
    colorPicker2.position(160,620);
    colorPicker3=createColorPicker("black");
    colorPicker3.position(160,660);

    createCanvas(200,200);
     background("skyblue"); 
     input=createInput("");
    input.position(20,20);
    input.input(updateText);

 }
 function draw(){

    fill(colorPicker.value())
    fill(colorPicker3.value());
    textSize(24);
    textAlign(CENTER,CENTER);
    text(userText,width/2,height/2);
   
    

 }
 function updateText(){
    userText=this.value();
 }
