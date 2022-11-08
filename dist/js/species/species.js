//the varibale name doesnt matter, just make sure it's included in the array at the end of this file!
let tutorialSpecies = {
    //This is your creature's unique id, it can be your name or the name of your species, or whatever!
    //remeber that strings are always enclosed in "quotes"
    id: "custom1",
    //appearance is an object inside our object, trippy!
    //This is just a way of bundling all the visual stuff together
    appearance: {
        //The Species folder has some spritesheets in it, any png spritesheet can be put her and used!
        file: "chef",
        //colour 0-1
        hue: 0.3,
        //saturation 0-1
        sat: 0.90,
        //transparency 0-1
        alpha: 0.9,
    },
    //What can this species eat?(see slides for details) Choices:
    //    "omnivore"   "carnivore"  "herbivore"
    diet: "omnivore",
    //How to reproduce?(see slides for details) Choices:
    //    "semelparity"   "mate"  "mitosis"
    reproduction: "mitosis",
    traits: ["thorns", "aquatic", "poisonous", "vampirism", "beserking", "protective", "grazing"],
    //All creatures start with the same stats and get strong as they level
    //these stats determine what gets buffed each level
    //This is a ratio only! setting attack to 10000 doesn't do anything :P
    //hp: hitpoints
    //atk: attack damage
    //def: defence (chance of negating all attack damage when attacked)
    //spd: speed (action cooldown recovery rate)
    //nrg: energy (amount of energy that can be digested and stored)
    stats: { hp: 1, atk: 4, def: 1, spd: 2, nrg: 2 },
    //This function just needs to return a string that is used to name each creature
    generateName: function () {
        //this mini-function just picks a random element in an array for us
        function pick(array) { return array[Math.floor(Math.random() * array.length)]; }
        let nameStart = ["Blob-", "Corn-", "Goblin-"];
        let nameEnd = ["Cob", "Bob", "Rob"];
        return pick(nameStart) + pick(nameEnd);
    },
    //This function is called once when Hexamon starts, if you need to initialise something
    instructionsStart: function (creature) {
    },
    //this function is called whenever the creature has nothing to do. Right now, it will move randomly
    instructions: function (creature) {
        creature.moveRandom();
    }
};
let exampleSpecies = {
    id: "custom2",
    appearance: {
        file: "witch",
        hue: 0.1,
        sat: 0.90,
        alpha: 0.2,
    },
    diet: "carnivore",
    reproduction: "mate",
    traits: [],
    stats: { hp: 1, atk: 1, def: 1, spd: 1, nrg: 1 },
    generateName: function () {
        function pick(array) { return array[Math.floor(Math.random() * array.length)]; }
        let nameStart = ["Crime ", "Slime ", "Grime "];
        let nameEnd = ["Lime", "Mime", "Time"];
        return pick(nameStart) + pick(nameEnd);
    },
    instructionsStart: function (creature) {
    },
    instructions: function (creature) {
        creature.moveRandom();
    }
};
//IMPORTANT, add all species to this array
export let species = [tutorialSpecies, exampleSpecies];
