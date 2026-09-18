// let userText="";
// let input;
// let ageinput;
// let colorPicker
 
//  function setup(){
//     colorPicker=createColorPicker("black");
//     colorPicker.position(20,40);
//  createCanvas(1500,200);
//  background("skyblue"); 
//      input=createInput("");
//     input.position(20,20);
//     input.input(updateText);
// 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥6️⃣7️⃣
//  }
//  function draw(){
//     background("skyblue");
//     fill(colorPicker.value());
//     textSize(24);
//     textAlign(CENTER,CENTER);
//     text(userText,width/2,height/2);
   
    

//  }
//  function updateText(){
//     userText=this.value();
//  }
// 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥6️⃣7️⃣
let noun;
let verb ;
let adjective;
let adverb;
let place;
let storyButton;
let text2pointo;
let storyText;
let storyTemplates;
function setup(){
    storyTemplates=[
        "the{adjective}{verb]decided to {} {} at the {place}.",
        "one day,a {adjective}{} wanted to {verb} {} in {place}",
        "did you hear about the{adjective}{noun} that tried to {}"
    ]
    createCanvas(700,700);
    background("skyblue"); 
    noun=createInput("");
    noun.position(width/2+20,35);
    verb=createInput("");
    verb.position(width/2+20,65);
    adjective=createInput("");
    adjective.position(width/2+20,95);
    adverb=createInput("");
    adverb.position(width/2+20,125);
    storyButton=createInput("create a story!!!");
    storyButton.position(20,20);
    storyButton.mousePressed(updateText);
}
function draw(){
    background("skyblue");
    textAlign(RIGHT,CENTER);
    textSize(18);
    text("type a noun(living thing)eg,wholphin",width/2,45)
    text("type a verb(action)eg,floccinaucinihilipilificating",width/2,45)
    text("type a adjective(a felling)eg,Supercalifragilisticexpialidocious ",width/2,45)
    text("type a adverb(a feeling a extreme expression)eg,spectrophotofluorometrically",width/2,45)
    text("type a place(somewere,a city,aplace,a country)eg,United Kingdom of Great Britain and Northern Ireland",width/2,45)

}
function updateText(){
    template
}