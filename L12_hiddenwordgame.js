let guessbutton;;
let guessword;
let atmpt=0;
let hints="s_____";
let wordlist
let hidword
function setup(){
    
    wordlist=["alarm", "angry", "arrow", "avoid", "badge", "basic" , "brush", "cabin", "cable",  "candy", "carry", "carve", "cause", "chain", "chalk", "charm", "chase", "cheap", "cheat", "check", "cheek", "cheer", "chest", "chief", "child", "chill", "choke", "chore", "claim", "clash", "class", "clean", "clear", "climb", "cloak", "clock", "close", "cloth", "cloud", "clown", "coach", "coast", "color", "cough", "count", "court", "cover", "crack", "craft", "crane", "crash", "crate", "crawl", "crazy", "cream", "crime", "crisp", "cross", "crowd", "crown", "cruel", "crumb", "crush", "crust", "curve", "cycle"]
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
}
function generatehint(aWord){
    print("word len="+aWord.length);
    let partial="_ ".repeat(aWord.length-1);
    return aWord[0]+partial;
}
function updateButton(){
    print("hello");
    atmpt++
}