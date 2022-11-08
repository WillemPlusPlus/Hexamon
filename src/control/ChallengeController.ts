import {rand} from '../utils.js';
import { GameController } from "./GameController.js"
import { isWithinRange } from "../utils.js"


import e1 from "../challenges/challenge1.js"
import e2 from "../challenges/challenge2.js"
import e3 from "../challenges/challenge3.js"
import e4 from "../challenges/challenge4.js"
import e5 from "../challenges/challenge5.js"
import e6 from "../challenges/challenge6.js"
import survive from "../challenges/challengeSurvival.js"
import CONFIG from '../data/config.js';
import { Tile } from '../Tile.js';


//Configure Hexamon:
// Create an interface for selecting various challenges and tracking which have been completed
// When a new challenge is selected, load the challenge settings
// Each challenge has a coresponding challenge script file through which students "solve" the challenge

export class ChallengeController{
    challenges: any[]
    victoryConditions: any
    gc: GameController
    challengeIndex = [0,0]
    popupGood: any
    popupBad: any
    files: any
    defeatConditions: any

    constructor(){
        this.challenges = challenges

        this.files = {e1, e2, e3, e4, e5, e6, survive}

        this.gc = new GameController(this, e1, this.challenge)
        window.onresize = this.gc.onResize

        let buttonRetry = {text:"Retry",onclick: this.buildChallenge }
        let buttonNext  = {text:"Next",onclick:this.iterateChallenge}
        this.popupGood = this.gc.ui.createDialog("Congratulations, you've solved the challenge!", [buttonRetry, buttonNext])
        this.popupBad = this.gc.ui.createDialog("You've failed the challenge!", [buttonRetry])

        this.victoryConditions = {
            foodHex:{
                check: (gc:GameController)=>{
                    const hex = gc.getRandomHex((candidate) => candidate.hasFood && candidate.hasCreature && candidate.creature.species.id == "custom" && candidate.creature.stateID == "idle")
                    return !(hex==undefined||hex==null)
                },
                textObjective: "Move to the tile with food on it to complete the challenge!",
            },
            kill:{
                check: (gc:GameController)=>{
                    let creatures = [...gc.creatures.values()]
                    if(creatures.length == 0)return false
                    return  creatures.filter((e)=>e.species.id == "enemy").length == 0
                },
                textObjective: "Kill every creature from rival species!",
            },
            time:{
                check: (gc:GameController)=>{
                    const bar = this.victoryConditions.time.ui.tags
                    bar.value += gc.dt

                    return(bar.value>bar.max)

        
                },
                reset: ()=>{
                    this.victoryConditions.time.ui.tags.value = 0
                },
        
                ui: {div:"progress",tags:{id:"challengeTime", max: 60, value: 0}},

                textObjective: "Survive until the time runs out!",
        
            },
            level:{
                check: (gc:GameController)=>{

                    let hero = [...gc.creatures.values()].find((e)=>e.species.id=="custom")
                    if(!hero)return false
                    const bar = this.victoryConditions.level.ui.tags
                    bar.value = hero.lvl

                    return(hero.lvl>=10)

        
                },
                reset: ()=>{
                    this.victoryConditions.level.ui.tags.value = 0
                },
        
                ui: {div:"progress",tags:{id:"challengeLevel", max: 10, value: 0}},

                textObjective: "Level your creature up to level 10!",
            }
        
        }
        this.defeatConditions = {
            survive:{
                check: (gc:GameController)=>{
                    let creaturesDead = [...gc.creaturesDead.values()]
                    for(const creature of creaturesDead){
                        if(creature.species.id == "custom"){
                            return true
                        }
                    }
                    return false
                },
                textObjective: "Don't let any of your creatures die!",
            }
        
        }
    }

    get challenge(){
        return this.challenges[this.challengeIndex[0]].data[this.challengeIndex[1]]
    }

    get winCon(){
        return this.victoryConditions[this.challenge.conditionW]
    }
    get loseCon(){
        return this.defeatConditions[this.challenge.conditionL]
    }

    //Reset elements and render the currently selected challenge
    buildChallenge = () => {
        if(this.winCon.reset)this.winCon.reset()
        if(this.loseCon.reset)this.loseCon.reset()
        this.popupGood.close()
        this.popupBad.close()
        this.gc.reset(this.files[this.challenge.props.file],this.challenge)
        setTimeout(() => {
            //Create the hex
            this.gc.createBoardCustom(this.challenge)
            this.gc.ui.populateChallengeBox(document.getElementById("uiWrapper"), this)
            this.gc.ui.updateChallengeInfo(this.challenge.props.text, this.winCon.textObjective , this.loseCon.textObjective)
            this.runChallenge()
          },750)

    }

    //Update Function
    runChallenge = () => {
        this.gc.animate()
        if(this.winCon.check(this.gc)){
            this.completeChallenge()
            return
        }
        if(this.loseCon.check(this.gc)){
            this.popupBad.show()
            return
        }
        this.gc.ui.updateChallengeTime(this.winCon.ui, this.loseCon.ui)
        window.requestAnimationFrame(this.runChallenge);
        

    }

    //Move sequentially through challenge list
    iterateChallenge =() => {

        this.challengeIndex[1]++
        if(this.challengeIndex[1] >= this.challenges[this.challengeIndex[0]].data.length){
            this.challengeIndex[0]++
            this.challengeIndex[1] = 0
        }
        if(this.challengeIndex[0] >= this.challenges.length){
            this.challengeIndex[0] = 0
            this.challengeIndex[1] = 0
        }
        this.buildChallenge()
    }

    //Mark challenge as completed
    completeChallenge(){
        this.challenge.props.tags.isComplete = 1
        this.challenge.props.text =  this.challenge.props.name+" (Completed)"
        this.popupGood.show()
    }
    //Set Challenge
    setChallenge(index){
        this.challengeIndex = index
        this.buildChallenge()
    }
}

// Challenge Data
const challenges = [
    {index: 0, text: "Challenge Pack 1: Intro", tags: {class: "challengeGroup", id: "cg0",completed: 0}, 
        data:[
            {
                hex: (hex):boolean=>{
                    return isWithinRange({row:0,col:0},hex,2)
                },

                creatures: ()=>{
                    return [
                        {pos:{row:0,col:0},species:"custom"},
    
                    ]
                },

                food: ()=>{
                    return [
                        {pos:{row:0,col:1},amount:50},
                    ]
                },
                conditionW: "foodHex",
                conditionL: "survive",
                props:{
                    index: 0, 
                    file: "e1",
                    name: "Challenge 1", 
                    text: "Challenge 1", 
                    tags: {
                        class: "challenge", 
                        id: "challenge0",
                        isComplete: 0,
                    }},
            },
            {
                hex: (hex):boolean=>{
                    return isWithinRange({row:0,col:0},hex,2)
                },

                creatures: ()=>{
                    return [
                        {pos:{row:0,col:0},species:"custom"},
                        {pos:{row:0,col:1},species:"enemy", lvl: 100},
                        {pos:{row:0,col:-1},species:"enemy", lvl: 100},
                        {pos:{row:1,col:0},species:"enemy", lvl: 100},
                        {pos:{row:-1,col:0},species:"enemy", lvl: 100},
                        {pos:{row:-1,col:-1},species:"enemy", lvl: 100},
    
                    ]
                },

                food: ()=>{
                    return [
                        {pos:{row:1,col:1},amount:50},
                    ]
                },
                conditionW: "foodHex",
                conditionL: "survive",
                props:{
                    index: 1, 
                    file: "e2",
                    name: "Challenge 2", 
                    text: "Challenge 2", 
                    tags: {
                        class: "challenge", 
                        id: "challenge1",
                        isComplete: 0,
                    }},
            },
            {
                hex: (hex):boolean=>{
                    return isWithinRange({row:0,col:0},hex,2)
                },

                creatures: ()=>{
                    return [
                        {pos:{row:0,col:0},species:"custom"},
                        {pos:{row:0,col:1},species:"enemy", lvl: 100},
                        {pos:{row:0,col:-1},species:"enemy", lvl: 100},
                        {pos:{row:1,col:0},species:"enemy", lvl: 100},
                        {pos:{row:-1,col:0},species:"enemy", lvl: 100},
                        {pos:{row:-1,col:-1},species:"enemy", lvl: 100},
                    ]
                },

                food: ()=>{

                    return [
                        {pos:{row:0,col:2},amount:50},
                        {pos:{row:0,col:-2},amount:50},
                    ]

                },
                conditionW: "foodHex",
                conditionL: "survive",
                props:{
                    index: 2, 
                    file: "e3",
                    name: "Challenge 3", 
                    text: "Challenge 3", 
                    tags: {
                        class: "challenge", 
                        id: "challenge2",
                        isComplete: 0,
                    }},
            },
            {
                hex: (hex):boolean=>{
                    return isWithinRange({row:0,col:0},hex,1)
                },

                creatures: ()=>{
                    return [
                        {pos:{row:1,col:1},species:"custom", lvl: 100},
                        {pos:{row:1,col:0},species:"custom", lvl: 100},
                        {pos:{row:0,col:1},species:"enemy"},
                        {pos:{row:0,col:-1},species:"enemy"},
                        {pos:{row:-1,col:-1},species:"enemy"},
                        {pos:{row:0,col:0},species:"enemy"},
    
                    ]
                },

                food: ()=>{
                    return [
                    ]
                },
                conditionW: "kill",
                conditionL: "survive",
                props:{
                    index: 3, 
                    file: "e4",
                    name: "Challenge 4", 
                    text: "Challenge 4", 
                    tags: {
                        class: "challenge", 
                        id: "challenge3",
                        isComplete: 0,
                    }},
            },
            {
                hex: (hex):boolean=>{
                    return isWithinRange({row:0,col:0},hex,3) && !(hex.row==0 && hex.col==0)&& !(hex.row==0 && hex.col==1)
                },

                creatures: ()=>{
                    return [
                        {pos:{row:1,col:1},species:"custom", lvl: 1},
                        {pos:{row:0,col:2},species:"enemy", lvl: 100},
                        {pos:{row:1,col:2},species:"enemy", lvl: 100},
                        //{pos:{row:2,col:2},species:"enemy", lvl: 100},
                        {pos:{row:2,col:1},species:"enemy", lvl: 100},
                        {pos:{row:2,col:0},species:"enemy", lvl: 100},
                        //{pos:{row:1,col:-1},species:"enemy", lvl: 100},
                        {pos:{row:0,col:-2},species:"enemy", lvl: 100},
                        {pos:{row:-1,col:-2},species:"enemy", lvl: 100},
                        {pos:{row:-1,col:2},species:"enemy", lvl: 100},
                        {pos:{row:-2,col:-2},species:"enemy", lvl: 100},
                        //{pos:{row:-2,col:-1},species:"enemy", lvl: 100},
                        {pos:{row:-2,col:0},species:"enemy", lvl: 100},

        
                    ]
                },

                food: ()=>{
                    return [
                        {pos:{row:-1,col:0},amount:50},
                    ]
                },
                conditionW: "foodHex",
                conditionL: "survive",
                props:{
                    index: 4, 
                    file: "e5",
                    name: "Challenge 5", 
                    text: "Challenge 5", 
                    tags: {
                        class: "challenge", 
                        id: "challenge4",
                        isComplete: 0,
                    }},
            },
            {
                hex: (hex):boolean=>{
                    return isWithinRange({row:0,col:0},hex,1)
                },

                creatures: ()=>{
                    let lvls = [100,100,100,100,100,100]
                    let iBaby = rand(6)
                    lvls[iBaby] = 1
                    return [
                        {pos:{row:0,col:0},species:"custom", lvl: 100},
                        {pos:{row:0,col:1},species:"enemy", lvl: lvls[0]},
                        {pos:{row:0,col:-1},species:"enemy", lvl: lvls[1]},
                        {pos:{row:1,col:0},species:"enemy", lvl: lvls[2]},
                        {pos:{row:-1,col:0},species:"enemy", lvl: lvls[3]},
                        {pos:{row:-1,col:-1},species:"enemy", lvl: lvls[4]},
                        {pos:{row:1,col:1},species:"enemy", lvl: lvls[5]},

        
                    ]
                },

                food: ()=>{
                    return [
                        {pos:{row:1,col:1},amount:50},
                        {pos:{row:0,col:1},amount:50},
                        {pos:{row:0,col:-1},amount:50},
                        {pos:{row:1,col:0},amount:50},
                        {pos:{row:-1,col:0},amount:50},
                        {pos:{row:-1,col:-1},amount:50},
                    ]
                },
                conditionW: "foodHex",
                conditionL: "survive",
                props:{
                    index: 5, 
                    file: "e6",
                    name: "Challenge 6", 
                    text: "Challenge 6", 
                    tags: {
                        class: "challenge", 
                        id: "challenge5",
                        isComplete: 0,
                    }},
            },
        ]
    },
    {index: 1, text: "Challenge Pack 2: Survival", tags: {class: "challengeGroup", id: "cg1",completed: 0}, 
        data:[
            {
                creatureSettings: {hasHP:true, hasNRG:true, hasXP: false},
                hexTick: (hex:Tile, dt)=>{
                    if(!hex.inArena)return
                    if(!hex.hasFood && Math.random()<0.1*dt)hex.spawnFood(Math.random()>0.7?50:20)
                },
                creatureTick: (creature, dt):void=>{
                    creature.modifyStat("nrg", -10*dt)
                },

                hex: (hex):boolean=>{
                    return isWithinRange({row:0,col:0},hex,5)
                },

                creatures: ()=>{
                    return [
                        {pos:{row:0,col:0},species:"custom"},
    
                    ]
                },

                food: ()=>{return []},
                conditionW: "time",
                conditionL: "survive",
                props:{
                    index: 0, 
                    file: "survive",
                    name: "Challenge 1: Eating and Energy", 
                    text: "Challenge 1: Eating and Energy", 
                    tags: {
                        class: "challenge", 
                        id: "survive0",
                        isComplete: 0,
                    }},
            },
            {
                creatureSettings: {hasHP:true, hasNRG:false, hasXP: true},
                hexTick: (hex:Tile, dt)=>{
                    if(!hex.inArena)return
                    if(!hex.hasCreature && Math.random()<0.05*dt){
                        hex.controller.createCreature(hex, "enemy", 1, {hasHP:true, hasNRG:false, hasXP: false})
                    }
                },
                creatureTick: (creature, dt):void=>{
                    creature.modifyStat("xp", 50*dt)
                },

                hex: (hex):boolean=>{
                    return isWithinRange({row:0,col:0},hex,5)
                },

                creatures: ()=>{
                    return [
                        {pos:{row:0,col:0},species:"custom"},
    
                    ]
                },

                food: ()=>{return []},
                conditionW: "level",
                conditionL: "survive",
                props:{
                    index: 1, 
                    file: "survive",
                    name: "Challenge 2: Enemies and XP", 
                    text: "Challenge 2: Enemies and XP", 
                    tags: {
                        class: "challenge", 
                        id: "survive1",
                        isComplete: 0,
                    }},
            },

            {
                creatureSettings: {hasHP:true, hasNRG:true, hasXP: true},
                hexTick: (hex:Tile, dt)=>{
                    if(!hex.inArena)return
                    if(!hex.hasCreature && Math.random()<0.05*dt){
                        hex.controller.createCreature(hex, "enemy", Math.random()>0.7?100:1, {hasHP:true, hasNRG:false, hasXP: false, hasDrops: true})
                    }
                },
                creatureTick: (creature, dt):void=>{
                    creature.modifyStat("nrg", -10*dt)
                    creature.modifyStat("xp", 50*dt)
                },

                hex: (hex):boolean=>{
                    return isWithinRange({row:0,col:0},hex,5)
                },

                creatures: ()=>{
                    return [
                        {pos:{row:0,col:0},species:"custom"},
    
                    ]
                },

                food: ()=>{return []},
                conditionW: "time",
                conditionL: "survive",
                props:{
                    index: 2, 
                    file: "survive",
                    name: "Challenge 3: Carnivores and Combat", 
                    text: "Challenge 3: Carnivores and Combat", 
                    tags: {
                        class: "challenge", 
                        id: "survive2",
                        isComplete: 0,
                    }},
            }
        ]
    }

]