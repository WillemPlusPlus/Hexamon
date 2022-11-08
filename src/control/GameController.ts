import CONFIG from "../data/config.js";
import { Tile } from "../Tile.js";
import { Creature } from "../Creature.js";
import { UIController } from "./UIController.js";
import { Particle } from "../Particle.js";
import { Entity } from "../Entity.js";
import { SpriteController } from "./SpriteController.js";
import {rand, randElement, range, copy} from "../utils.js"
import { ChallengeController } from "./ChallengeController.js";
import { CustomController } from "./CustomController.js";
import {BattleController} from "./BattleController.js";
import Pokedex from "../data/pokedex.js";

//Configure Hexamon:
//Handle creating and updating game objects
export class GameController{

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    hexAngle: number;
    hexRadius: number;
    hexMargin: number;

    ui: UIController;
    sprites: SpriteController;
    
    particles: Particle[];
    hexTiles: Map<string, Tile>;
    creatures: Map<string, Creature>;
    creaturesDead: Map<string, Creature>;
    type: string;
    clock: number;
    dt: number;
    puppetMaster: boolean;
    inject: any;
    injectChallenge: any
    updateCD: number;
    controller: ChallengeController|CustomController|BattleController;
    centerInitial: {x: number, y: number}
    centerOffset: {x: number, y: number}

    defaultInstructions = true

    constructor(controller?: ChallengeController|CustomController|BattleController, inject?:any, injectChallenge?:any){

        this.controller = controller
        
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.backgroundColor = CONFIG.canvas.colors.background;
        this.centerInitial = {x: this.canvas.width/2, y: this.canvas.height/2}
        this.centerOffset = {x: 0, y: 0}

        this.hexAngle = CONFIG.hex.angle;
        this.hexRadius = CONFIG.hex.radius;
        this.hexMargin = CONFIG.hex.margin;

        this.hexTiles =  new Map<string, Tile>();
        this.creatures = new Map<string, Creature>();
        this.creaturesDead = new Map<string, Creature>();
        this.particles = [];

        this.ui = new UIController(this);
        this.sprites = new SpriteController();

        this.type = "controller"
        this.clock = Date.now();
        this.updateCD = 0;
        this.dt = 0;
        
        this.puppetMaster = false
        if(inject){
            this.inject = inject
            this.injectChallenge = injectChallenge
            this.defaultInstructions = false
        }
    }

    /**
     * Return game to starting state
     * @param inject optional custom behaviour info object
     * @param injectChallenge optional scenario behaviour info object
     */
    reset(inject?:any, injectChallenge?:any){
        this.hexTiles.clear();
        this.creatures.clear();
        this.creaturesDead.clear();
        this.particles = [];
        if(inject)this.inject = inject
        if(injectChallenge)this.injectChallenge = injectChallenge
    }

    /**
     * Return whether it is time to update game state yet
     * @returns bool
     */
    isUpdateFrame(): boolean{
        this.updateCD -= this.dt;
        if(this.updateCD <= 0){
            this.updateCD = CONFIG.gameController.tickRate;
            return true;
        }
        return false;
    }

    /**
     * Update Function, run every frame
     */
    animate = () => {
        //update clock
        this.dt = (Date.now() - this.clock)/1000;
        this.dt = this.dt>1?1:this.dt;
        this.clock = Date.now();
        this.update();
        this.draw();
    }


    /**
     * Set some display props
     * usually only needs to happen on resize
     */
    onResize = () => {
        if(!this.ctx)throw "Cannot resize CTX is null";
        this.ctx.fillStyle = CONFIG.canvas.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerOffset = {x: this.canvas.width/2 - this.centerInitial.x, y: this.canvas.height/2 - this.centerInitial.y}
    }


    /**
     * Get a gameObject by ID
     * @param idObject ID string following the format [creature/tile] + "#" + [id]
     *                 or [id]
     * @returns object or null if not found
     */
    get(idObject: string){
        let id, obj
        if(!idObject){return null}
        let idComponents = idObject.split("#")
        switch(idComponents.length){
            case 1:
                id = idComponents[0]
                if(this.creatures.has(id))
                    {return this.creatures.get(id)}
                if(this.hexTiles.has(id))
                    {return this.hexTiles.get(id)}
                return null
            case 2:
                obj = idComponents[0]
                id = idComponents[1]
                if(obj === "creature"){
                    if(this.creatures.has(id))
                        {return this.creatures.get(id)}
                    return null
                }
                if(obj === "tile"){
                    if(this.hexTiles.has(id))
                        {return this.hexTiles.get(id)}
                    return null
                }
                if(obj == "sprite"){
                    if(this.sprites.has(id))
                        {return this.sprites.get(id)}
                    return null
                }
                throw "This controller does not maintain a collection of type: " + obj
            default:
                throw "Invalid id: " + idObject
        }
    }

    


    getFoodSprite(){
        return this.sprites.get("food")
    }


    //Update game state
    //States which affect animations need to be updated on all frames
    //everything else can be updated on server tick frames only

    /**
     * Update game state
     * States which affect animations need to be updated on all frames
     * everything else can be updated on server tick frames only
     */
    update(){

        const tick = this.isUpdateFrame()


        if(this.ui.toolSelected =="spawnRandomCreature"){

            this.createCreatureAt(-1,-1, false);
            this.ui.toolSelected = "none"
        }

        if(this.ui.toolSelected =="spawnCustomCreature"){
            this.createCreatureAt(-1,-1, true);
            this.ui.toolSelected = "none"
        }

        for (let [id,creature] of this.zSort(this.creatures) as [string,Creature][]){
            if(!creature.isAlive){
                this.creaturesDead.set(id, creature)
                this.spawnParticles(creature.position.x, creature.position.y, "die");
                this.creatures.delete(id)
            }else{
                //if(this.defaultInstructions)this.maybeMoveCreature(creature, CONFIG.creature.moveChance);
                //if(this.puppetMaster)this.maybeAttackCreature(creature, CONFIG.creature.attackChance);
                if(tick && creature.species.instructions && creature.stateID == "idle" && creature.readyToMove){
                    creature.species.instructions(creature)
                };
                if(this.injectChallenge && this.injectChallenge.creatureTick)this.injectChallenge.creatureTick(creature, this.dt)
                creature.update(this.dt,tick);
            }

        }
        //only update particles and tiles on update frames
        if(!tick)return
        for (let particle of this.particles){
            if (particle.life <= 0) {
                this.particles.splice(this.particles.indexOf(particle), 1);
            }
            particle.update({});
        }
        for (let [id, hex] of this.zSort(this.hexTiles) as [string,Tile][]) {
            if(this.injectChallenge&&this.injectChallenge.hexTick)this.injectChallenge.hexTick(hex, this.dt)
            if(this.defaultInstructions)hex.growFood(this.dt)
        }
        
    }

    /**
     * Update screen
     * Draw every hex
     * Render the infobox
     */

    draw() {
        if(!this.ctx)throw "Cannot draw CTX is null";

        this.ctx.fillStyle = CONFIG.canvas.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);



        for (let [id, hex] of this.zSort(this.hexTiles) as [string,Tile][]) {
            hex.draw(this.ctx, this.centerOffset);
        }

        for (let particle of this.particles){
            particle.draw(this.ctx, this.centerOffset);
        }

        for (let [id,creature] of this.zSort(this.creatures) as [string,Creature][]){
            creature.draw(this.ctx, this.centerOffset);
        }

        //this.ui.draw();
    }

    //small chance to spawn food on the hex
    maybeSpawnFood(hex: Tile, chance: number){
        if(Math.random() < chance && !hex.hasFood && hex.inArena){ 
            hex.spawnFood()
        }

    }

    /**
     * small chance to move a creature to a random adjacent hex
     */

    maybeMoveCreature(creature: Creature, chance: number) {
        if (creature.stateID != "idle") {
            return false;
        }
        if (Math.random() < chance) {
            let hex = creature.hex;
            let adjacentHexes: Tile[] = [];
            for (let [id, hexNew] of this.hexTiles){
                if (this.isWithinRange(hex, hexNew, 1) && hexNew != hex && hexNew.inArena) {
                    adjacentHexes.push(hexNew);
                }
            }
            let newHex = adjacentHexes[rand(adjacentHexes.length)];
            creature.moveToHex(newHex);
            return true
        }
        return false
    }



    /**
     * Handle creature reproduction
     * @param creature parent creature
     */
    spawnCreatures(creature: Creature){
        let hex = creature.hex
        let n = Math.ceil(creature.lvl/Pokedex.stats.lvlsPerBaby)
        range(n).forEach(()=>{
            this.spawnCreature(hex, 5)
        })
        hex.creature = creature
    }


    /**
     * Handle creature reproduction
     * Place individual offspring on board
     * @param hexParent hex occupied by parent
     * @param range max distance int
     * @param lvl baby lvl int
     */
    spawnCreature(hexParent:Tile, range = 2, lvl = 1){
        let parent = hexParent.creature
        let hexBaby = this.getRandomHex((hex)=>this.isWithinRange(hex, parent.hex, range)&&hex.inArena&&(!hex.hasCreature))
        if(hexBaby){
            let baby = new Creature(this, hexParent, parent.species.id)
            baby.moveToHex(hexBaby)
            this.creatures.set(baby.id.toString(), baby);
        }
        hexParent.creature = parent
    }

    /**
     * Handle creature reproduction
     * Mitosis-style split
     * @param creature Parent creature
     */
    splitCreature(creature:Creature){
        let hex = creature.hex
        this.spawnCreature(hex, 2, Math.ceil(creature.lvl/2))
        this.spawnCreature(hex, 2, Math.ceil(creature.lvl/2))
        creature.die()
        return true
    }

    /**
     *
     * @param row the row of the tile
     * @param col the column of the tile
     * @returns the x and y coordinates of the tile
    */
        getXY(row, col) {
        const r = CONFIG.hex.radius;
        const m = CONFIG.hex.margin;
        const a = CONFIG.hex.angle;
        let x = col * 2 * (r) * Math.sin(a) - row * r * Math.sin(a);
        let y = row * 3 * (r) / 2;
        x += this.canvas.width / 2;
        y += this.canvas.height / 2;
        return {x, y};
    }

    /**
     * Get the hex tile at the given row and column
     * @param row the row of the tile
     * @param col the column of the tile
     * @returns hex tile or null if no hex tile exists at the given row and column
     */
    getHex(row, col){
        return Array.from(this.hexTiles.values()).find((e)=>e.row == row && e.col == col);
    }

    /**
     * Lay out new hex objects in a hexagon pattern
     * @param populate create creatures as well? bool
     * @param radius int
     * @param radiusBG number of background hexes to create as a border radius int
     */
         createBoard(populate = true, radius = CONFIG.board.radius, radiusBG = CONFIG.board.radiusBG) {
            let x = this.canvas.width / 2;
            let y = this.canvas.height / 2;
            let row = 0;
            let col = 0;
            let center = new Tile(x,y,col,row,this,true)
            this.hexTiles.set(center.id.toString(),center)
            let offset = 2 * (this.hexRadius + this.hexMargin) * Math.sin(this.hexAngle);
            // for each layer of the spiral
            for (let i = 0; i < radiusBG; i++) {
                x += offset;
                col += 1;
                // for each side of the layer
                for (let j = 0; j < 6; j++) {
                    // for each hexagon in the side
                    for (let k = 0; k <= i; k++) {
                        let newTile = new Tile(x,y,col,row, this);
                        this.hexTiles.set(newTile.id.toString(),newTile);
                        if (this.isWithinRange(newTile, center, radius)) {
                            newTile.addToBoard();
                        }
                        if (populate && k > 1 && newTile.inArena) {
                            let creature = new Creature(this, newTile);
                            this.creatures.set(creature.id.toString(),creature);
                        }
                        x += offset * Math.cos((j + 2) * this.hexAngle);
                        y += offset * Math.sin((j + 2) * this.hexAngle);
                        col += Math.round(Math.cos((j + 2) * this.hexAngle));
                        row += Math.round(Math.sin((j + 2) * this.hexAngle));
                    }
                }
            }
        }


    /**
     * create hexes, creatures and food objects acording to a prop data object
     * @param props set up info object
     */
    createBoardCustom(props){
        this.createBoardGrid(100, 50);
        [...this.hexTiles.values()].forEach((e)=>{e.inArena = props.hex(e)})

        const creatures = props.creatures()
        for(const creatureProps of creatures){
            let hex = this.getHex(creatureProps.pos.row, creatureProps.pos.col);
            if(!hex) throw "No hex found at row: " + creatureProps.pos.row + " col: " + creatureProps.pos.col;
            let settings = this.injectChallenge?this.injectChallenge.creatureSettings:creatureProps.settings
            let creature = new Creature(this, hex, creatureProps.species, creatureProps.lvl, settings);
            if(creature.species.instructionsStart){creature.species.instructionsStart(creature)}
            this.creatures.set(creature.id.toString(), creature);
        }
        const food = props.food()
        for(const foodProps of food){
            let hex = this.getHex(foodProps.pos.row, foodProps.pos.col);
            if(!hex) throw "No hex found at row: " + foodProps.row + " col: " + foodProps.col;
            hex.spawnFood(foodProps.amount);
        }
    }

    /**
     * Create a board of hexes following a simple grid layout
     * @param rows int
     * @param cols int
     */
    createBoardGrid(rows, cols){
        for(const row of range(-rows/2, rows/2)){
            for(const col of range(-cols/2, cols/2)){
                let pos = this.getXY(row, col);
                let hex = new Tile(pos.x, pos.y, col, row, this, false);
                this.hexTiles.set(hex.id.toString(), hex);
            }
        }

    }
    /**
     * set random hexes in a rough line configuration to a given biome
     * @param type biome string
     */
    setBiomeLine(type){
        const rock1 = this.getRandomHex((tile)=>tile.inArena)
        rock1.setBiome(type)
        const rock2 = this.getRandomHex((tile)=>tile.inArena)
        rock2.setBiome(type)

        let col = rock1.col
        let row = rock1.row
        let biomeNew

        while(col!= rock2.col && row != rock2.row){
            if(col>rock2.col)col -= rand(2)
            else col += rand(2)

            if(row>rock2.row)row -= rand(2)
            else row += rand(2)

            biomeNew = this.getHex(row, col)
            biomeNew.setBiome(type)
        }

    }

    /**
     * Randomly surround hex of a given biome with a second biome 
     * @param typeOld Biome to look for string
     * @param typeNew Biome to create around typeOld string
     * @param size radius int
     * @param chance prop num
     * @param typeFilter only affect a given biome, otherwise set to "any" string
     */
    setBiomeThickness(typeOld, typeNew, size, chance, typeFilter="grass"){
        let biomes
        for(let iterate of range(size)){
            biomes = [...this.hexTiles.values()].filter((tile)=>{return (typeFilter=="any" || tile.biome == typeFilter) && tile.inArena && Math.random()<chance && this.checkNeighbors(tile.row, tile.col, typeOld)})
            biomes.forEach((hex)=>hex.setBiome(typeNew))
        }
    }

    /**
     * alter biomes if they are completely surrounded e.g. shallow water becomes deep
     */
    elevateBiomes(){
        for(let hex of [...this.hexTiles.values()]){
            if(hex.biome=="grass" &&  this.elevateNeigbors(hex.row, hex.col, ["grass"])){hex.setBiome("lush")}
            if(hex.biome=="rock"  &&  this.elevateNeigbors(hex.row, hex.col, ["rock", "cliff"])){hex.setBiome("cliff")}
            if(hex.biome=="sand"  &&  this.elevateNeigbors(hex.row, hex.col, ["sand"])){hex.setBiome("lush")}
            if(this.elevateNeigbors(hex.row, hex.col, ["ocean"])){hex.setBiome("ocean")}
        }
    }

    /**
     * Check whether a given tile is eligible for biome elevation
     * @param row int
     * @param col int
     * @param types 
     * @returns bool
     */
    elevateNeigbors(row, col, types:Array<string>):boolean{
        const deltas = [[-1,0],[0,1],[1,1],[1,0],[0,-1],[-1,-1]]
        let  neighbors = deltas.map((d)=>{return this.getHex(row+d[0], col+d[1])})
        for(let n of neighbors){
            if(n != undefined && !types.includes(n.biome)){
                return false
            }
        }
        return true
    }

    /**
     * Check if a given hex neigbhors a given biome
     * @param row int
     * @param col int
     * @param type biome string
     * @returns bool
     */
    checkNeighbors(row, col, type){
        const deltas = [[-1,0],[0,1],[1,1],[1,0],[0,-1],[-1,-1]]
        let  neighbors = deltas.map((d)=>{return this.getHex(row+d[0], col+d[1])})
        for(let n of neighbors){
            if(n != undefined && n.biome == type){
                return true
            }
        }
        return false

    }

    /**
     * Example of a procedural map generator using the above functions
     * @param props set up info object
     */
    createBoardBiome(props){
        this.createBoardCustom(props);
        [...this.hexTiles.values()].forEach(hex=>{hex.inArena?hex.setBiome("grass"):hex.setBiome("ocean")})
        this.setBiomeThickness("ocean", "ocean",  2, 0.1)
        this.setBiomeThickness("ocean", "water",  1, 1)
        this.setBiomeThickness("water", "water",  2, 0.1)
        this.getRandomHex((hex)=>hex.biome=="grass").setBiome("sand")
        this.setBiomeThickness("sand", "sand",  3, 0.6)
        this.setBiomeThickness("water", "sand",  1, 0.8)
        this.setBiomeLine("rock")
        this.setBiomeLine("rock")
        this.setBiomeThickness("rock","rock", 3, 0.3, "any")
        this.elevateBiomes()


    }
    

    
    /**
     * Get nearest hex to x,y
     * @param x num
     * @param y num
     * @returns Hex Tile
     */
    getClosestHex(x:number, y:number):Tile {
        let closest;
        let closestDistance = Number.MAX_SAFE_INTEGER;
        for (let [id, hex] of this.hexTiles) {
            if(!closest){closest = hex;}
            let distance = Math.pow(x - hex.position.x, 2) + Math.pow(y - hex.position.y, 2);
            if (distance < closestDistance) {
                closest = hex;
                closestDistance = distance;
            }
        }
        return closest;
    }

    /**
     * Get a random hex from hexes meeting a condition
     * @param filter function that takes a hex and returns validity
     * @returns Hex Tile
     */
    getRandomHex(filter = (candidate: Tile) => true):Tile {
        let candidates = [...this.hexTiles.values()].filter(filter);
        return candidates[rand(candidates.length)]
    }



    /**
     * function to check if two hexagons are within a range of each other
     * @param hex1 Tile
     * @param hex2 Tile
     * @param range num
     * @returns bool
     */

    isWithinRange(hex1:Tile, hex2:Tile, range:number):boolean {
        let row1 = hex1.row;
        let col1 = hex1.col;
        let row2 = hex2.row;
        let col2 = hex2.col;
        return Math.abs(row1 - row2) <= range && Math.abs(col1 - col2) <= range && Math.abs((row1 - col1) - (row2 - col2)) <= range;
    }
    /**
     * function to check if a hexagon is in the same row or column as another hexagon
     * @param hex1 tile
     * @param hex2 tile
     * @returns bool
     */
    isSameRowOrCol(hex1: Tile, hex2: Tile):boolean {
        return hex1.row === hex2.row || hex1.col === hex2.col || hex1.row - hex1.col === hex2.row - hex2.col;
    }


    /**
     * Find the hexagon which is moused over (called in index.js on mousemove)
     * @param {MouseEvent} e
     */
    updateMousePosition = (e: MouseEvent) => {
        for(let [id, hex] of this.hexTiles){
            hex.mouseOver = false;
        }
        let x = e.offsetX;
        let y = e.offsetY;
        let hex = this.getClosestHex(x, y);
        hex.mouseOver = true;
    }



    /**
     * Create a new creature on the tile nearest to the mouse.
     * @param {float} x - x coordinate on canvas.
     * @param {float} y - y coordinate on canvas.
     */
    createCreatureAt(x: number,y: number, isCustom:boolean) {
        let hex;
        if(x == -1 && y == -1){
            hex = this.getRandomHex((candidate:Tile)=>!candidate.hasCreature && candidate.inArena)
        }else{
            hex = this.getClosestHex(x, y);
        }

        let creature
        if(isCustom){
            creature = new Creature(this, hex,"custom", rand(3)+1, {hasHP:true, hasNRG:true, hasXP: true, hasDrops:true});
        }else{
            creature = new Creature(this, hex,"random");
        }
        this.creatures.set(creature.id.toString(),creature);
        
    }

    /**
     * New Creature
     * @param hex Tile
     * @param species string
     * @param lvl number
     * @param settings behaviour props
     */
    createCreature(hex:Tile, species:string, lvl:number, settings){
        let creature = new Creature(this, hex, species, lvl, settings);
        this.creatures.set(creature.id.toString(),creature);
    }

    /**
     * Create a new tile on the tile nearest to the mouse.
     * @param {float} x - x coordinate on canvas.
     * @param {float} y - y coordinate on canvas.
     */
    createTileAt(x: number,y: number) {
        let hex = this.getClosestHex(x, y);
        hex.addToBoard()
    }

    /**
     * Highlight mouseover hex
     * @param x num
     * @param y num
     */
    toggleSelected(x: number,y: number) {
        let hex = this.getClosestHex(x, y);
        hex.selected = !hex.selected;
    }

    
    
    /**
     * Find the hexagon that was selected and display its props in the infoBox.
     * Draw infoBox in the DOM
     * @param {float} x - x coordinate on canvas.
     * @param {float} y - y coordinate on canvas.
     */
     changeInfoObject(x: number,y: number) {
        let hex = this.getClosestHex(x, y);
        this.ui.infoObject = hex;
    }


    /**
     * delete creature at x,y
     * @param x num
     * @param y num
     */
    deleteCreatureAt(x: number, y: number) {
        let hex = this.getClosestHex(x, y);
        if (hex.hasCreature) {
            hex.creature.die();
        }
    }

    /**
     * Particle emission
     * @param x num
     * @param y num
     * @param preset id string 
     */
    spawnParticles(x: number, y: number, preset) {
        let props = CONFIG.particle.presets[preset];
        for (let i = 0; i < props.n; i++) {
            let colour = randElement(props.colours)
            //let particle = new Particle ({position:{x,y},colour:colour});
            //this.particles.push(particle);
        }
    }


    /**
     * Called in index.js on click. Manages onClick functionality based on tool selected
     * @param {MouseEvent} e 
     */
    clickEvent = (e: MouseEvent) => {
        let x = e.offsetX;
        let y = e.offsetY;
        switch(this.ui.toolSelected){
            case "createCreature": 
                this.createCreatureAt(x,y, false);
                break;
            case "createTile": 
                this.createTileAt(x,y)
                break;
            case "cursor":
                this.toggleSelected(x,y)
                this.changeInfoObject(x,y)
                break;
            case "deleteCreature":
                this.deleteCreatureAt(x,y);
                break;
            default:
                break;

                


        }
    }
    zSort(obj:Map<string,Entity>){
        let list = Array.from(obj.entries())
        list.sort((a,b)=>{

            return a[1].position.y - b[1].position.y
        })
        
        return list
    }
}




