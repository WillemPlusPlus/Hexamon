
import { Entity } from "./Entity.js";
import { Tile } from "./Tile.js";
import { GameController } from "./control/GameController.js";
import { rand } from "./utils.js";
import CONFIG from "./data/config.js";
import Pokedex from "./data/pokedex.js";

export class Food extends Entity {

    type: string;
    hex: Tile;
    amount: number;
    spriteID: number;
    controller: GameController;
    colour: string
    group: number
    cooldown: number;

    constructor(hex: Tile, controller: GameController, colour = "green", group  = 1 ) {
        super({ position: { x: hex.x, y: hex.y }});
        this.type = "food";
        this.hex = hex;
        this.group = group
        this.amount = Food.getAmount(group)
        this.controller = controller;
        this.colour = colour
    }

    get x(){return this.hex.x}
    get y(){return this.hex.y}

    static getAmount(group){
        if(group<1)return CONFIG.food.amounts[1]
        let base = CONFIG.food.amounts[Math.floor(group)]
        return base + base * (group%1)
    }

    getBite(max){
        let amount
        if(max<this.amount){
            this.amount -= max;
            amount = max;
        }else{
            amount = this.amount;
            this.amount = 0;
            this.hex.unSpawnfood()
            this.hex = undefined;
        }
        return amount;
    }

    combine(colour, group){
        if(colour != this.colour){this.colour = "yellow"}else{
            this.colour = colour
        }
        this.amount += Food.getAmount(group)
        this.amount = this.amount>1000?1000:this.amount
        this.group = 0
        while(CONFIG.food.amounts[this.group+1]<this.amount)this.group++
    }

    draw(ctx: CanvasRenderingContext2D, offset = {x:0,y:0}) {
        let sprite  = this.controller.getFoodSprite()
        let scale = 0.4
        if(this.group == 1) scale = 0.3
        if(this.group == 0) scale = 0.2
        sprite.draw(ctx, {x:this.x+offset.x,y:this.y+offset.y},{w:scale,h:scale}, this.colour)

    }
}