 let userText="ENTER UR NAME HERE";
 let input;
 let agetext="age";
 let ageinput;
let colorPicker
 
 function setup(){
    colorPicker=createColorPicker("#ff6200");
    colorPicker.position(160,580);
    createCanvas(600,600);
     background("skyblue"); 
     input=createInput("");
    input.position(160,520);
    input.input(updateText);
    ageinput=createInput("");
    ageinput.position(160,545);
    ageinput.input(updateageText);
 }
 function draw(){
     background(colorPicker.value())
    fill("White")
    rect(50,250,500,200)
    fill(0);

    textSize(24);
    textAlign(CENTER,CENTER);
    text(userText,width/2,height/2);
    textSize(30);
    textAlign(LEFT);
    text("enter ur password",50,350)
    

 }
 function updateText(){
    userText=this.value();
 }
 function updateageText(){
    agetext = this.value();
 }


