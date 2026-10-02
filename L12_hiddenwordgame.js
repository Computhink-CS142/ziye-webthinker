let guessbutton;;
let guessword;
let atmpt=0;
let hints="s_____";
let wordlist
let hidword
let message
function setup(){
    
    wordlist=["alarm", "angry", "arrow", "avoid", "badge", "zbasic" , "brush", "cabin", "carry", "carve", "cause", "chain", "chest", "chief", "child", "chill", "choke", "chore", "claim", "class", "clean", "clear", "climb", "clock", "close", "cloth", "cloud", "clown", "coach", "coast", "color", "cough", "count", "court", "cover", "crack", "craft", "crane", "crash", "crazy", "cream",  "crisp", "cross", "crowd", "crush", "cycle"]
    hidword=random(wordlist);
    hidword=hidword.toUpperCase();

    print("the hidden word is "+hidword);
    hints=generatehint(hidword)
    createCanvas(1000,700);
    background("lightgrey"); 
    guessword=createInput("");
    guessword.size(150,30);
    guessword.style("font-size","20px")
    guessword.position(300,400);
    guessbutton=createButton("?guess?");
    guessbutton.position(width/2+25,400);
    guessbutton.size(150,30);
    guessbutton.style("font-size","20px")
    guessbutton.mousePressed(updateButton);
}
function draw(){
    background("lightgrey");
    textSize(70);
    text("GUESS THE HIDDEN WORD!",0,150);
    

    textSize(50);
    text("Attempts:"+atmpt,300,300);
    text("Hint:"+hints,300,350)
    text(message,600,200)
}
function generatehint(aWord){
    print("word len="+aWord.length);
    let partial="_ ".repeat(aWord.length-1);
    return aWord[0]+partial;
}
function updateButton(){
    print("hello");
    let guesstwo=guessword.value();
    guesstwo=guesstwo.toUpperCase();
    if(guesstwo==hidword){
        message="you won!";
        print(message)
    }
    else{
        atmpt++    
    }

}