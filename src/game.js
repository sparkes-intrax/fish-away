// ==================== GAME STATE ====================
let inventory = [];
let energy = 10;
let gold = 0;
let historyEnabled = true;
let currentIsland = null;
let currentRod = null;

// ==================== ISLANDS ====================
const islands = [
    {name: "Lake Shadowdeep", rarityBonus: 0},
    {name: "Crystal Cove", rarityBonus: 5},
    {name: "Mystic Lagoon", rarityBonus: 10},
    {name: "Dragon's Reef", rarityBonus: 15}
];
currentIsland = islands[0];

// =================== Questions ==================
const historyQuestions = [
    {q:"Who was first US President?", opts:["George Washington","Abraham Lincoln","Jefferson","John Adams"], ans:"George Washington"},
    {q:"Year WWII ended?", opts:["1940","1945","1939","1950"], ans:"1945"},
    {q:"Who won the 2022 World Cup in Qatar?", opts:["Argentina","France","Brazil","Germany"], ans:"Argentina"},
    {q:"What year did the Berlin Wall fall?", opts:["1987","1989","1991","1993"], ans:"1989"}
];

// ==================== RARITY TIERS ====================
const rarityTiers = [
    {name: "Dookie", chance: 50, multiplier: 0.5, gold: 1},
    {name: "Terrible", chance: 40, multiplier: 0.8, gold: 2},
    {name: "Ok", chance: 30, multiplier: 1, gold: 5},
    {name: "Decent", chance: 20, multiplier: 1.5, gold: 10},
    {name: "Good", chance: 10, multiplier: 2, gold: 50},
    {name: "Awesome", chance: 5, multiplier: 5, gold: 1000},
    {name: "OP", chance: 1, multiplier: 10, gold: 50000000000000000000000000000000}
];

// ==================== FISH ====================
let fishTypes = [];
const commonNames = ["Minnow","Trout","Bass","Carp","Golden Koi","Perch","Catfish","Pike","Salmon"];
for(let i=0;i<500;i++){
    const name = `${commonNames[Math.floor(Math.random()*commonNames.length)]} #${i+1}`;
    fishTypes.push({name: name, points: Math.floor(Math.random()*5)+1, rarity: Math.floor(Math.random()*40)+40});
}
// Special fish
const specialFish = [
    {name:"Shadowfin Dragon", points:20, rarity:3, exotic:true},
    {name:"Megalodon", points:50, rarity:1, secret:true},
    {name:"Sylla", points:25, rarity:5, exotic:true},
    {name:"Leviathan", points:30, rarity:4, exotic:true},
    {name:"The Black Mamba", points:60, rarity:1, exotic:true}
];
fishTypes = fishTypes.concat(specialFish);

// Assign random rarity tier to fish
fishTypes.forEach(f=>{
    const choices = rarityTiers.map(r=>r.name);
    const weights = rarityTiers.map(r=>r.chance);
    f.rarityName = weightedRandom(choices, weights);
    f.goldValue = rarityTiers.find(r=>r.name===f.rarityName).gold;
});

// ==================== RODS ====================
let rods = [
    {name:"Basic Rod", multiplier:1, price:0, rarity:50},
    {name:"Iron Rod", multiplier:1.5, price:100, rarity:60},
    {name:"Golden Rod", multiplier:3, price:1000, rarity:70},
    {name:"Balls Rod", multiplier:10, price:1000000, rarity:100, special:true}
];
// generate 50 more rods
for(let i=0;i<50;i++){
    rods.push({name:`Rod #${i+1}`, multiplier:1+i*0.2, price:50*(i+1), rarity:Math.min(50+i,99)});
}
currentRod = rods[0];

// ==================== UTILITIES ====================
function log(msg){
    const div = document.getElementById("log");
    div.innerHTML += msg + "<br>";
    div.scrollTop = div.scrollHeight;
}
function weightedRandom(choices, weights){
    let sum = weights.reduce((a,b)=>a+b,0);
    let rnd = Math.random()*sum;
    for(let i=0;i<choices.length;i++){
        if(rnd<weights[i]) return choices[i];
        rnd -= weights[i];
    }
    return choices[choices.length-1];
}

// ==================== GAME FUNCTIONS ====================
function catchFish(){
    while(true){
        const fish = fishTypes[Math.floor(Math.random()*fishTypes.length)];
        const rodBonus = Math.floor(currentRod.rarity/5);
        const tierBonus = rarityTiers.find(r=>r.name===fish.rarityName).multiplier;
        const totalChance = Math.min(fish.rarity + currentIsland.rarityBonus + rodBonus,100);
        if(Math.random()*100<=totalChance){
            fish.goldValue *= tierBonus;
            return fish;
        }
    }
}

function flashyEffect(fish){
    inventory.push(fish);
    log(`🎣 You caught ${fish.name} (${fish.rarityName}) with ${currentRod.name}! Value: ${fish.goldValue} gold`);
}

function askHistoryQuestion(){
    if(!historyEnabled) return null;
    const q = historyQuestions[Math.floor(Math.random()*historyQuestions.length)];
    log(`📚 Question: ${q.q}`);
    log(`Options: ${q.opts.join(", ")}`);
    return q;

}

function fish(){
    if(energy<=0){log("Too tired! Rest first."); return;}
    const q = askHistoryQuestion();
    energy -= 1;
    log("Casting line...");
    if(Math.random()<0.3){log("Nothing bites."); return;}
    log("A fish is tugging!");
    // Defer prompt to allow the log to render before the blocking prompt appears
    if(!q){
        const fishCaught = catchFish();
        flashyEffect(fishCaught);
        return;
    }
    setTimeout(()=>{
        const answer = prompt("Answer the question to continue (type exactly):");
        if(answer !== q.ans){
            log("Incorrect answer. No Fish.");
        }
        else{
            const fishCaught = catchFish();
            flashyEffect(fishCaught);
        }
    },0);
}

function showInventory(){
    if(inventory.length===0){log("No fish yet."); return;}
    log("=== Inventory ===");
    inventory.forEach(f=>log(`${f.name} (${f.rarityName}) = ${f.goldValue} gold`));
    log(`Gold: ${gold}`);
}

function sellFish(){
    if(inventory.length===0){log("No fish to sell."); return;}
    const f = inventory.pop();
    gold += f.goldValue;
    log(`Sold ${f.name} for ${f.goldValue} gold`);
}

function rest(){
    energy = 10;
    log("You rest and restore energy.");
}

function travel(){
    log("Choose an island to travel:");
    islands.forEach((i,index)=>log(`${index+1}. ${i.name}`));
    const choice = prompt("Enter island number:");
    if(choice>=1 && choice<=islands.length){
        currentIsland = islands[choice-1];
        log(`⛴ You travel to ${currentIsland.name}`);
    }
}

function adminPanel(){
    const cmd = prompt("Admin commands: 1=Energy 2=Gold 3=Give Rod 4=Toggle History");
    if(cmd==="1"){energy=10; log("Energy restored");}
    else if(cmd==="2"){gold+=1000000; log("Gold added");}
    else if(cmd==="3"){
        let rodStr="Choose rod:\n";
        rods.forEach((r,i)=>rodStr+=`${i+1}. ${r.name}\n`);
        const choice = prompt(rodStr);
        if(choice>=1 && choice<=rods.length){
            currentRod = rods[choice-1];
            log(`Gave rod: ${currentRod.name}`);
        }
    }
    else if(cmd==="4"){historyEnabled=!historyEnabled; log(`History enabled=${historyEnabled}`);}
}

// ==================== INITIAL MESSAGE ====================
window.onload = () => {
    log("🎣 Welcome to Fish Away! 🎣");
    log(`You start at ${currentIsland.name} with ${currentRod.name}.`);
};