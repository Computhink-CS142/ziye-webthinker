 let userText="ENTER UR NAME HERE";
 let input;
 let agetext="age";
 let ageinput;
let colorPicker
let colorPicker2
let colorPicker3
 
 function setup(){
    colorPicker=createColorPicker("#0055ff");
    colorPicker.position(160,580);
    colorPicker2=createColorPicker2("#0062ff");
    colorPicker2.position(160,600);
    
    createCanvas(600,700);
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

    fill(colorPicker2.value())
    rect(50,300,500,160,50)
    fill(0);

    textSize(24);
    textAlign(CENTER,CENTER);
    text(userText,width/2,height/2);
     textSize(24);
    textAlign(CENTER,CENTER);
    text(agetext,width/2,height/2+80);
   
    

 }
 function updateText(){
    userText=this.value();
 }
 function updateageText(){
    agetext = this.value();
 }


