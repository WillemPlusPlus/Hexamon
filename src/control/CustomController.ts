import { GameController } from "./GameController.js";
import { isWithinRange } from "../utils.js"
import POKEDEX from "../data/pokedex.js";
import { Sprite } from "./SpriteController.js";

//Configure Hexamon:
// Create an interface for modifying creature visual properties
// And a small area for view the effects of these changes on the creatures

export class CustomController{
    gc: GameController;
    constructor(){
        this.gc = new GameController(this)
        let board = { 
            hex: (hex):boolean=>{return isWithinRange({row:0,col:0},hex,5)},
            creatures: ()=>{return []},
            food: ()=>{return []}
        }
        this.gc.createBoardCustom(board)
        this.gc.ui.createUI(document.getElementById("uiWrapper"))
        this.gc.ui.populateCustomiseBox()
        let buttonApply = document.getElementById("customiseButton")
        buttonApply.addEventListener("click",this.applyCustomSettings)
        setTimeout(() => {this.runSandbox()},200)

    }

    //Update Function
    runSandbox = () => {
        this.gc.animate()
        window.requestAnimationFrame(this.runSandbox);
    }

    //Submit interface form infomation and update game info
    applyCustomSettings = (event) => {
        let settings = this.gc.ui.getCustomiseData()
        
        this.gc.creatures.forEach(
            creature=>{
                if(creature.species.id == "custom"){
                    creature.species.appearance = settings
                    let sprite = this.gc.get("sprite#"+creature.sprite) as Sprite
                    creature.sprite = this.gc.sprites.generateSprite(creature.species.appearance, POKEDEX.stats.lvlSpritePresets[creature.age]+"_custom"),sprite.partIndex }})
        
    }



}