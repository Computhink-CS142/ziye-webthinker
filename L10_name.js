//  let userText="ENTER UR NAME HERE";
//  let input;
//  let agetext="age";
//  let ageinput;

 
//  function setup(){
//     createCanvas(600,600);
//      background("skyblue"); 
//      input=createInput("");
//     input.position(160,520);
//     input.input(updateText);
//     ageinput=createInput("");
//     ageinput.position(160,545);
//     ageinput.input(updateageText);
//  }
//  function draw(){
//     fill(0);
//     background("skyblue");
//     textSize(24);
//     textAlign(CENTER,CENTER);
//     text(userText,width/2,height/2);
//     textSize(30);
//     textAlign(LEFT);
//     text("enter ur password",50,350)
    

//  }
//  function updateText(){
//     userText=this.value();
//  }
//  function updateageText(){

//  }

let colorPicker
function setup(){
    createCanvas(1534,727);
    colorPicker=createColorPicker("#ff6200");
    colorPicker.position(300,300);
}
function draw(){
    background(colorPicker.value())
    fill("White")
    rect(width/2,height/2,560,200)
}
