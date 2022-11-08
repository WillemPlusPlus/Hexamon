import CONFIG from "./data/config.js";
import { Food } from "./food.js";
import { Entity } from "./Entity.js";
export class Tile extends Entity {
    static id = 0;
    col;
    row;
    creature;
    food;
    hasFood;
    inArena;
    mouseOver;
    selected;
    type;
    typeId;
    biome;
    controller;
    biomeSprite;
    cooldown;
    constructor(x, y, col, row, controller, inArena = false) {
        super({ position: { x, y } });
        this.type = "tile";
        this.typeId = Tile.id++;
        this.col = col;
        this.row = row;
        this.creature;
        this.food;
        this.hasFood = false;
        this.biome = "test";
        this.inArena = inArena;
        this.mouseOver = false;
        this.selected = false;
        this.controller = controller;
        this.biomeSprite = this.controller.sprites.get("hex");
        this.cooldown = 0;
    }
    get x() {
        return this.position.x;
    }
    get y() {
        return this.position.y;
    }
    get hasCreature() {
        return this.creature != undefined && this.creature != null;
    }
    get hasBaby() {
        return this.hasCreature && this.creature.age == 0;
    }
    get foodType() {
        return this.food.colour;
    }
    get foodAmount() {
        return this.food.amount;
    }
    get terrain() {
        return this.biome;
    }
    hasEnemy(spec) {
        return this.hasCreature && this.creature.species.id == spec;
    }
    hasFriend(spec) {
        return this.hasCreature && this.creature.species.id == spec;
    }
    // add tile to the board
    addToBoard() {
        this.inArena = true;
    }
    growFood(dt) {
        if (!this.inArena) {
            return false;
        }
        if (!this.hasCreature) {
            this.cooldown = dt > this.cooldown ? 0 : this.cooldown - dt;
        }
        else {
            this.cooldown = CONFIG.food.cooldown;
        }
        if (this.cooldown != 0) {
            return false;
        }
        let chance = CONFIG.food.fertility[this.biome] * CONFIG.food.spawnChance;
        let roll = Math.random();
        let amount = 0;
        if (roll < chance) {
            if (roll < chance / 5) {
                amount++;
            }
            if (roll < chance / 25) {
                amount++;
            }
            let colour = "green";
            if ((this.biome == "rock" || this.biome == "water") && Math.random() < 0.5) {
                colour = "red";
            }
            if (this.biome == "sand") {
                colour == "red";
            }
            this.spawnFood(amount, colour);
        }
    }
    spawnFood(amount = 1, colour = "green") {
        if (this.hasFood) {
            this.food.combine(colour, amount);
        }
        else {
            this.food = new Food(this, this.controller, colour, amount);
            this.hasFood = true;
        }
    }
    unSpawnfood() {
        this.food = undefined;
        this.hasFood = false;
    }
    setBiome(name) {
        if (name == "ocean" || name == "cliff") {
            this.inArena = false;
        }
        this.biome = name;
    }
    /**
     * draw text offset from center
     * @param {CanvasRenderingContext2D} ctx - the canvas context
     * @param {String} text - text to draw
     * @param {Object} offset - Expects a x and y property, offset from the center of the hexagon
     */
    drawText(ctx, text, offset, x = this.position.x, y = this.position.y) {
        ctx.font = CONFIG.canvas.text.font;
        ctx.textAlign = CONFIG.canvas.text.align;
        ctx.textBaseline = CONFIG.canvas.text.baseline;
        ctx.fillStyle = CONFIG.canvas.colors.text;
        ctx.fillText(text, x + offset.x, y + offset.y);
    }
    drawTexture(ctx, x = this.position.x, y = this.position.y, clear = true) {
        this.biomeSprite.draw(ctx, this.position, { w: 1, h: 1 }, this.biome);
    }
    /**
     * draw this tile's hexagon
     * @param {Boolean} clear - delete underlying?
     */
    drawHexagon(ctx, x = this.position.x, y = this.position.y, clear = true) {
        ctx.beginPath();
        ctx.moveTo(x, y + CONFIG.hex.radius);
        for (let i = 1; i <= 6; i++) {
            ctx.lineTo(x + CONFIG.hex.radius * Math.sin(i * CONFIG.hex.angle), y + CONFIG.hex.radius * Math.cos(i * CONFIG.hex.angle));
        }
        ctx.closePath();
        ctx.lineWidth = CONFIG.hex.borderWidth;
        //Change stroke border for inArea and not
        ctx.strokeStyle = this.inArena
            ? CONFIG.canvas.colors.hexBorder
            : CONFIG.canvas.colors.hexInactive;
        if (this.mouseOver) {
            ctx.strokeStyle = CONFIG.canvas.colors.hexHighlight;
        }
        if (clear && this.inArena) {
            ctx.fillStyle = CONFIG.canvas.colors.hex;
            if (this.selected) {
                ctx.fillStyle = CONFIG.canvas.colors.hexSelected;
            }
            ctx.fill();
        }
        // if (Math.random() < 0.5) {
        //   ctx.fillStyle = "red";
        //   ctx.fill();
        // }
        ctx.stroke();
    }
    /**
     * draw this tile and its stuff
     * @param {Boolean} clear - delete underlying?
     */
    draw(ctx, offset = { x: 0, y: 0 }, clear = true) {
        let position = { x: this.position.x + offset.x, y: this.position.y + offset.y };
        //there might be more than one reason to highlight
        //Draw hexagon
        if (this.biome == "test") {
            this.drawHexagon(ctx, position.x, position.y, clear);
        }
        else {
            this.drawTexture(ctx, position.x, position.y);
        }
        if (this.hasFood)
            this.food.draw(ctx, offset);
        if (this.inArena) {
            let textPosition = String(this.col) + "," + String(this.row);
            //Draw Position
            //this.drawText(ctx, textPosition, CONFIG.hex.textPositionOffset, position.x, position.y);
        }
    }
}
