let userText="";
let input;
let ageinput;
let colorPicker
let colorPicker2
let colorPicker3
 
 function setup(){
    colorPicker=createColorPicker("#0055ff");
    colorPicker.position(10,50);
    colorPicker2=createColorPicker("#ffffff");
    colorPicker2.position(160,620);
    colorPicker3=createColorPicker("black");
    colorPicker3.position(160,660);

    createCanvas(200,200);
     background("skyblue"); 
     input=createInput("");
    input.position(160,520);
    input.input(updateText);
    ageinput=createInput("");
    ageinput.position(160,545);

 }
 function draw(){
     background(colorPicker.value())

    fill(colorPicker2.value())
    fill(colorPicker3.value());

    textSize(24);
    textAlign(CENTER,CENTER);
    text(userText,width/2,height/2);
   
    

 }
 function updateText(){
    userText=this.value();
 }
