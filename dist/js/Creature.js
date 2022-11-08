import CONFIG from "./data/config.js";
import POKEDEX from "./data/pokedex.js";
import { Entity } from "./entity.js";
import { Img } from "./control/SpriteController.js";
import ANIMS from "./data/animations.js";
import { dist, copy, rand } from "./utils.js";
import { species } from "./species/species.js";
import { traits } from "./data/traits.js";
import { Particle } from "./Particle.js";
export class Creature extends Entity {
    static id = 0;
    static states = CONFIG.creature.states;
    name;
    element;
    stats;
    xp;
    lvl;
    lvlXP;
    age;
    positionSprite;
    hex;
    sprite;
    controller;
    translation;
    spriteSheetIndex;
    type;
    typeId;
    route;
    velocity = { dx: 0, dy: 0 };
    stateID = CONFIG.creature.stateDefault;
    animId = Creature.states[this.stateID].animation;
    IHD = (2 * CONFIG.hex.radius * Math.cos(Math.PI / 6) + CONFIG.hex.margin); //interhexdistance
    species;
    cooldown;
    bars = [];
    hasHP = true;
    hasNRG = true;
    hasXP = true;
    hasDrops = false;
    ui;
    cooldownFert;
    effectSources;
    cooldownFast = 0.2;
    cooldownMedium = 1;
    cooldownSlow = 5;
    /**
     * Pure Helper function to get current stats from lvl and species
     * @param lvl Creature Level 1-99
     * @param statsRatio Stats object with weightings
     * @returns Stats object with weightings * lvl + minimum
     */
    static generateCurrentStats(lvl, statsRatio) {
        let stats = copy(POKEDEX.stats.min);
        for (let stat in stats) {
            stats[stat] += lvl * POKEDEX.stats.lvlFactor * statsRatio[stat];
        }
        return stats;
    }
    /**
     * Pure Helper function to normalise species stat weights
     * @param statsTemplate: Stats object
     * @returns : Stats object (0-1 and sanitised)
     */
    static generateStatRatio(statsTemplate) {
        let stats = copy(statsTemplate);
        let total = 0;
        for (let stat in stats) {
            let value = stats[stat];
            value = isNaN(value) ? 1 : value;
            value = value <= 0 ? 1 : value;
            total += value;
            stats[stat] = value;
        }
        for (let stat in stats) {
            stats[stat] /= total;
        }
        return stats;
    }
    /**
     * Set all stats to a number
     * @param n: number
     * @returns Stats object
     */
    static generateStats(n) {
        let stats = {};
        for (let stat of POKEDEX.stats.names) {
            stats[stat] = n;
        }
        return stats;
    }
    /**
     * @param dt delta t
     * @param dest Pos Object destination
     * @param pos Pos Object current postion
     * @param v dx dy
     * @returns updated position
     */
    static updateKinematics(dt, dest, pos, v) {
        let position = { x: pos.x, y: pos.y };
        let velocity = { dx: v.dx, dy: v.dy };
        let destination = { x: dest.x, y: dest.y };
        // if the creature is in the wrong hex, move it to the correct hex
        if (destination.x != pos.x
            || dest.y != pos.y
                && velocity.dx == 0
                && velocity.dy == 0) {
            let theta = Math.atan2(dest.y - pos.y, dest.x - pos.x);
            velocity = {
                dx: velocity.dx * CONFIG.creature.speed * Math.cos(theta),
                dy: velocity.dy * CONFIG.creature.speed * Math.sin(theta)
            };
            position.x += velocity.dx * dt;
            position.y += velocity.dy * dt;
            // if the creature is at the correct hex, stop moving
            if (Math.abs(dest.x - pos.x) < Math.abs(velocity.dx * dt) &&
                Math.abs(dest.y - pos.y) < Math.abs(velocity.dy * dt)) {
                position.x = dest.x;
                velocity.dx = 0;
                position.y = dest.y;
                velocity.dy = 0;
            }
        }
        else {
            position = destination;
            velocity = v;
        }
        return { position: position, velocity: velocity };
    }
    /**
     * There are a max of 6 valid moves that can be made with +1/-1 row/col movement but there are 2 options +1 +1 and -1 -1 which are not valid
     * @param rowD row delta
     * @param colD col delta
     * @param debug boolean debugging comments
     * @returns boolean valid?
     */
    static isValidMove(rowD, colD, debug = true) {
        const movesValid = [[-1, 0], [0, 1], [1, 1], [0, -1], [-1, -1], [1, 0]];
        let delta = [rowD, colD];
        for (let move of movesValid) {
            if (move[0] == delta[0] && move[1] == delta[1]) {
                return true;
            }
        }
        if (debug)
            console.log(rowD + " , " + colD + " is not a valid move.");
        return false;
    }
    constructor(controller, hex, speciesID = "", lvl = 1, settings = { hasHP: true, hasNRG: true, hasXP: true, hasDrops: true }) {
        super({ position: { x: hex.x, y: hex.y }, size: { w: 2, h: 2 } });
        this.type = "creature";
        this.typeId = Creature.id++;
        this.translation = { x: [], y: [] };
        this.spriteSheetIndex = 0;
        this.hex = hex;
        this.hex.creature = this;
        this.controller = controller;
        this.ui = controller.ui;
        this.effectSources = [];
        this.lvl = lvl;
        this.lvlXP = POKEDEX.stats.lvlStep * this.lvl;
        this.xp = 0;
        this.age = POKEDEX.stats.lvlBreakPoints[0] < this.lvl ? 1 : 0;
        let preset = POKEDEX.stats.lvlSpritePresets[this.age];
        this.species = species.filter((s) => s.id == speciesID)[0];
        this.sprite = this.controller.sprites.generateSprite(this.species.appearance, preset + "_custom");
        this.positionSprite = this.position;
        this.name = this.species.generateName();
        if (!this.species.traits) {
            console.log(this.species.id + " does not have a trait list, please add one");
        }
        if (settings) {
            this.hasHP = settings.hasHP;
            this.hasNRG = settings.hasNRG;
            this.hasXP = settings.hasXP;
            this.hasDrops = settings.hasDrops;
            if (this.hasXP && speciesID != "enemy")
                this.bars.push("xp");
            if (this.hasHP && speciesID != "enemy")
                this.bars.push("hp");
            if (this.hasNRG && speciesID != "enemy")
                this.bars.push("nrg");
        }
        this.stats = {};
        this.stats.ratio = Creature.generateStatRatio(this.species.stats);
        this.stats.base = Creature.generateCurrentStats(this.lvl, this.stats.ratio);
        this.stats.mods = Creature.generateStats(0);
        this.stats.boosts = Creature.generateStats(1);
        this.triggerTrait("onSpawn");
        this.cooldown = this.cooldownMax;
        this.cooldownFert = POKEDEX.stats.cdFertMax;
        this.route = { start: this.hex, end: this.hex, distance: 0, distanceTotal: 0 };
        this.stats["toJSON"] = () => {
            let string = "";
            for (let stat of POKEDEX.stats.names) {
                string += stat + ": " + this.getStat(stat).toFixed(1) + " ";
            }
            return string;
        };
    }
    get state() {
        return Creature.states[this.stateID];
    }
    get x() {
        return this.position.x;
    }
    get y() {
        return this.position.y;
    }
    get readyToMove() {
        return this.stateID == "idle" && this.cooldown == 0;
    }
    get target() {
        if (!this.isAttacking)
            return undefined;
        return this.route.end.creature;
    }
    get speciesName() { return this.species.id; }
    get isCustom() { return this.species.id != "enemy" && this.species.id != "random"; }
    get isFertile() { return this.lvl >= POKEDEX.stats.lvlsFertile && this.cooldownFert == 0; }
    get isAttacking() {
        return this.stateID == "attack";
    }
    get isMoving() {
        return this.stateID == "move";
    }
    get isIdle() { return this.stateID == "idle"; }
    /**
     * Convert speed to action cooldown
     */
    get cooldownMax() {
        let a = (POKEDEX.stats.cdMax);
        let b = POKEDEX.stats.cdSpdFac;
        let c = POKEDEX.stats.cdMin;
        let x = this.getStat("spd");
        return (a + (Math.random() * a * this.lvl / 100)) / (x * b) + c;
    }
    /**
     * Get net stat (base + modifications)
     * @param stat string name of stat
     * @returns number
     */
    getStat(stat) {
        if (stat == "xp")
            return this.xp;
        return (this.stats.base[stat] + this.stats.mods[stat]) * this.stats.boosts[stat];
    }
    /**
     * Add modification to stat's stored mods
     * @param stat string name of stat
     * @param mod number
     */
    modifyStat(stat, mod) {
        if (stat == "xp")
            this.xp += mod;
        else
            this.stats.mods[stat] += mod;
    }
    boostStat(stat, mod) {
        if (!this.stats.boosts[stat]) {
            console.log(stat, " is not a recognised stat name");
        }
        else {
            this.stats.boosts[stat] *= mod;
        }
    }
    /**
     * Creatures' positions are anchored to their tile but various effects apply translations
     * Each effect is decomposed to x and y and added to a creature's translation object
     * This function applies the translations (usually applied just before draw)
     * @param position
     * @param filter
     * @param autoKeep
     * @returns
     */
    applyTranslations(position, filter = "", autoKeep = false) {
        let translationsPermanent = { x: [], y: [] };
        let translations = { x: 0, y: 0 };
        for (let axis of ["x", "y"]) {
            let pop = this.translation[axis].pop();
            while (pop) {
                if ((!pop.isTemporary || autoKeep) || (filter && pop.source != filter))
                    translationsPermanent[axis].push(pop);
                if (!filter || (filter && pop.source == filter))
                    translations[axis] += pop.value;
                pop = this.translation[axis].pop();
            }
            this.translation[axis] = translationsPermanent[axis];
        }
        return { x: position.x + translations.x, y: position.y + translations.y };
    }
    /**
     * Called every frame by game controller
     * @param dt delta t
     * @param isUpdateFrame Whether to do non-rendering computations
     */
    update(dt, isUpdateFrame) {
        if (isUpdateFrame) {
            this.calculateEffects(dt);
            this.metabolise(dt);
        }
        this.cooldown = dt > this.cooldown ? 0 : this.cooldown - dt;
        this.cooldownFert = dt > this.cooldownFert ? 0 : this.cooldown - dt;
        this.updateState(dt);
    }
    /**
     * update creature route, state and position
     * @param dt delta t
     */
    updateState(dt) {
        let { position, velocity } = Creature.updateKinematics(dt, this.route.end, this.position, { dx: this.stats.boosts.spd, dy: this.stats.boosts.spd });
        this.position = position;
        this.velocity = velocity;
        this.route.distanceTotal = dist(this.route.start, this.route.end);
        this.route.distance = dist(this.position, this.route.start);
        const progress = this.route.distanceTotal ? this.route.distance / this.route.distanceTotal : 0;
        if (progress == 1 && this.stateID != "idle") {
            if (this.stateID == "attack") {
                this.dealDamage(this.route.end);
                //Go home
                this.route.start = this.route.end;
                this.route.end = this.hex;
            }
            if (this.stateID == "mitosis") {
                this.mitosis();
            }
            if (this.stateID == "mate") {
                this.mate();
                this.route.start = this.route.end;
                this.route.end = this.hex;
            }
            this.cooldown = this.cooldownMax;
            this.stateID = this.state.next;
        }
        this.animate(progress, this.state.animation);
        this.positionSprite = this.applyTranslations(position);
    }
    triggerTrait(trigger, them) {
        for (let traitName of this.species.traits) {
            let trait = traits.find((t) => t.name == traitName);
            if (!trait) {
                throw "Trait" + traitName + " does not exist";
            }
            let list = them && trait.affectEnemy ? them.effectSources : this.effectSources;
            if (trait.start == trigger && !list.find((e) => trait.name == e.name)) {
                list.push({ time: Date.now(), amount: 0, trait: trait });
            }
        }
        for (let effect of this.effectSources) {
            if (effect.trait.step == trigger) {
                this.callEffect(effect, them);
            }
        }
    }
    callEffect(effect, them) {
        let time = (Date.now() - effect.time) / 1000;
        effect.amount += 1;
        if (effect.trait.stop(time, effect.amount)) {
            effect.trait.effect(this, them);
        }
        else {
            this.effectSources = this.effectSources.filter((e) => { e.trait.name != effect.trait.name; });
        }
    }
    calculateEffects(dt) {
        this.stats.boosts = Creature.generateStats(1);
        this.cooldownFast -= dt;
        this.cooldownMedium -= dt;
        this.cooldownSlow -= dt;
        let callEffect = false;
        for (let effect of this.effectSources) {
            if (effect.trait.step == "everyFrame")
                callEffect = true;
            if (effect.trait.step == "every12Frames" && this.cooldownFast <= 0)
                callEffect = true;
            if (effect.trait.step == "every60Frames" && this.cooldownMedium <= 0)
                callEffect = true;
            if (effect.trait.step == "every300Frames" && this.cooldownSlow <= 0)
                callEffect = true;
            if (typeof effect.trait.step == "function" && effect.trait.step(this))
                callEffect = true;
            if (callEffect) {
                this.callEffect(effect, this);
            }
        }
        for (let traitName of this.species.traits) {
            let trait = traits.find((t) => t.name == traitName);
            if (!trait) {
                throw "Trait" + traitName + " does not exist";
            }
            let list = this.effectSources;
            if (typeof trait.start == "function" && !list.find((e) => trait.name == e.name) && trait.start(this)) {
                list.push({ time: Date.now(), amount: 0, trait: trait });
            }
        }
        if (this.cooldownFast <= 0)
            this.cooldownFast = 0.2;
        if (this.cooldownMedium <= 0)
            this.cooldownMedium = 1;
        if (this.cooldownSlow <= 0)
            this.cooldownSlow = 5;
    }
    /**
     * roll to see if damage is negated
     * @returns boolean did a doge occur?
     */
    dodgeDamage() {
        if (Math.random() < POKEDEX.stats.defFactor * this.getStat("def") ** 0.5) {
            this.triggerTrait("negateDamage");
            this.xp += POKEDEX.xp.dodge;
            let particle = copy(CONFIG.particle.presets.text);
            particle.position = { x: this.x, y: this.y };
            particle.text = "NEGATED";
            let p = new Particle(particle);
            this.controller.particles.push(p);
            return true;
        }
        return false;
    }
    /**
     * Attempt to damage a creature in a given tile
     * @param hex Tile target
     * @returns
     */
    dealDamage(hex) {
        if (!hex.hasCreature)
            return;
        if (hex.creature.dodgeDamage())
            return;
        this.triggerTrait("dealDamage");
        hex.creature.triggerTrait("takeDamage", this);
        if (hex.creature.takeDamage(POKEDEX.stats.atkFactor * this.getStat("atk"))) {
            this.triggerTrait("dealFatalDamage");
            this.xp += POKEDEX.xp.kill;
        }
        else {
            this.xp += POKEDEX.xp.dealDamage;
        }
    }
    /**
     * update hp and xp given damage taken
     * @param damage
     * @returns
     */
    takeDamage(damage) {
        let text = Math.abs(Math.round(damage)).toString();
        let particle = copy(CONFIG.particle.presets.text);
        let value = Math.abs(damage);
        value = Math.floor(value > 40 ? 40 : value);
        value = damage > 0 ? (60 + value) : (40 - value);
        let rgb = Img.hsvToRgb({ h: value, s: 1, v: 1 });
        let hexCode = "#";
        for (let c of ["r", "g", "b"]) {
            hexCode = hexCode + (rgb[c].toString(16).padStart(2, "0"));
        }
        particle.colour = hexCode;
        particle.velocity = { dy: -Math.random(), dx: Math.random() - 0.5 };
        particle.position = { x: this.x, y: this.y };
        particle.text = text;
        particle.opacityDelta = -0.02;
        let p = new Particle(particle);
        this.controller.particles.push(p);
        this.xp += POKEDEX.xp.takeDamage;
        //this.controller.spawnParticles(this.x, this.y, "blood")
        this.stats.mods.hp -= damage;
        return -this.stats.mods.hp >= this.stats.base.hp;
    }
    /**
     * Deterimine if this creature can eat the food on a given tile
     * @param hex: Tile
     * @returns Boolean
     */
    isEdible(hex = this.hex) {
        if (!hex.hasFood) {
            return false;
        }
        return POKEDEX.attributes.diet[this.species.diet].includes(hex.food.colour);
    }
    reproduce() {
        this.triggerTrait("onReproduce");
    }
    semelparity() {
        this.reproduce();
        this.controller.spawnCreatures(this);
    }
    /**
     * tell gc to mitosis me
     */
    mitosis() {
        this.reproduce();
        this.controller.splitCreature(this);
    }
    /**
     * tell gc to sexual reproduce me
     */
    mate() {
        this.reproduce();
        this.stats.mods.nrg = -this.stats.base.nrg;
        this.cooldownFert = POKEDEX.stats.cdFertMax;
        this.controller.spawnCreature(this.route.end);
    }
    /**
     * Determine how the state of the creature and its environment are modifying the creature's stats
     * @param dt delta t
     */
    metabolise(dt) {
        if (this.hasNRG && this.hex.hasFood && this.stateID == "idle" && this.isEdible() && this.stats.mods.nrg < 0) {
            this.triggerTrait("onEat");
            let biteMax = -1 * this.stats.mods.nrg;
            biteMax = Math.min(biteMax, POKEDEX.stats.nrgBiteFactor * this.stats.base.nrg * dt);
            let bite = this.hex.food.getBite(biteMax);
            this.stats.mods.nrg += bite;
            this.stats.mods.nrg = this.stats.mods.nrg > 0 ? 0 : this.stats.mods.nrg;
            this.xp += bite * POKEDEX.xp.food;
        }
        if (this.hasNRG) {
            //if the creature has energy
            if (this.getStat("nrg") > 0) {
                //use some energy to regen health and gain xp
                this.stats.mods.nrg -= POKEDEX.stats.nrgFactor * this.lvl ** 0.5 * dt;
                this.stats.mods.hp += POKEDEX.stats.hpRegenFactor * this.lvl ** 0.5 * dt;
            }
            else {
                this.stats.mods.hp -= POKEDEX.stats.hpDegenFactor * this.stats.base.hp * dt;
                this.stats.mods.nrg = -this.stats.base.nrg;
            }
        }
        if (this.hasHP && this.getStat("hp") <= 0) {
            this.die();
        }
        if (this.hasXP && this.xp >= this.lvlXP) {
            if (this.lvl == POKEDEX.stats.lvlMax) {
                this.xp = this.lvlXP;
            }
            else {
                this.lvlUp();
            }
        }
    }
    /**
     * level up, reset hp, increment level, boost stats etc.
     */
    lvlUp() {
        this.triggerTrait("onLevelUp");
        this.xp -= this.lvlXP;
        this.lvlXP += POKEDEX.stats.lvlStep;
        this.lvl++;
        this.stats.base = Creature.generateCurrentStats(this.lvl, this.stats.ratio);
        if (this.lvl >= POKEDEX.stats.lvlBreakPoints[this.age]) {
            this.age++;
            let sprite = this.controller.get("sprite#" + this.sprite);
            let preset = this.species.appearance.file ? POKEDEX.stats.lvlSpritePresets[this.age] + "_custom" : POKEDEX.stats.lvlSpritePresets[this.age];
            this.sprite = this.controller.sprites.generateSprite(this.species.appearance, preset, "body", sprite.partIndex);
        }
        this.controller.spawnParticles(this.x, this.y, "lvlup");
    }
    /**
     * Set death flag (and reproduce if semelparitic)
     */
    die() {
        this.triggerTrait("onDespawn");
        if (this.species.reproduction == "semelparity" && this.isFertile) {
            this.semelparity();
        }
        if (this.hasDrops)
            this.hex.spawnFood(3 * this.lvl / 100, "red");
        this.hex.creature = null;
        this.isAlive = false;
    }
    /**
     * Set state: mate
     * @param hex
     * @returns
     */
    setMate(hex) {
        if (!hex.hasCreature)
            return;
        this.route.start = this.hex;
        this.route.end = hex;
        this.stateID = "mate";
    }
    /**
     * Set state: mitotis
     * @param hex
     * @returns
     */
    setMitosis(hexNew) {
        if (hexNew.hasCreature)
            return;
        //clear old tile
        let hexOld = this.hex;
        hexOld.creature = null;
        //set new tile
        this.hex = hexNew;
        this.hex.creature = this;
        this.route.start = hexOld;
        this.route.end = hexNew;
        this.stateID = "mitosis";
    }
    /**
     * Set state: attack
     * When moving to a hex with a creature in it, attack the creature instead and return to current hex
     * @param hex
     * @returns
     */
    setAttack(hex) {
        if (!hex.hasCreature)
            return;
        this.route.start = this.hex;
        this.route.end = hex;
        this.stateID = "attack";
    }
    /**
     * set state: move
     * @param hexNew
     */
    setMovement(hexNew) {
        //clear old tile
        let hexOld = this.hex;
        hexOld.creature = null;
        //set new tile
        this.hex = hexNew;
        this.hex.creature = this;
        //update route
        this.route.start = hexOld;
        this.route.end = hexNew;
        this.stateID = "move";
    }
    //Aliases for the 6 move directions
    moveL() { return this.moveRelative(0, -1); }
    moveR() { return this.moveRelative(0, 1); }
    moveLup() { return this.moveRelative(-1, 0); }
    moveRup() { return this.moveRelative(-1, -1); }
    moveLdown() { return this.moveRelative(1, 0); }
    moveRdown() { return this.moveRelative(1, 1); }
    moveRandom() { return this.move(rand(6)); }
    /**
     * set state: idle
     * use only for cancelling movement state
     */
    moveCancel() {
        if (this.stateID == "idle") {
            return;
        }
        this.route.end = this.route.start;
        this.stateID = "idle";
        this.hex = this.route.end;
        return false;
    }
    /**
     * Return a hex in a given direction
     * @param d 0-5 map to the row/col moves [-1,0],[0,1],[1,1],[1,0],[0,-1],[-1,-1]
     * @returns Tile
     */
    look(d) {
        let direction = d % 6;
        const moves = [[-1, 0], [0, 1], [1, 1], [1, 0], [0, -1], [-1, -1]];
        return this.controller.getHex(this.hex.row + moves[direction][0], this.hex.col + moves[direction][1]);
    }
    /**
     * Try to move in a given direction
     * @param d 0-5 map to the row/col moves [-1,0],[0,1],[1,1],[1,0],[0,-1],[-1,-1]
     * @returns Boolean success
     */
    move(d) {
        if (!this.readyToMove)
            return false;
        let direction = d % 6;
        const moves = [[-1, 0], [0, 1], [1, 1], [1, 0], [0, -1], [-1, -1]];
        return this.moveRelative(moves[direction][0], moves[direction][1]);
    }
    /**
     * Not for public consumtion, this utillity function gives an easy way to map various useful movement methods into instructions that can be run
     * @param rowD -1, 0, +1
     * @param colD -1, 0, +1
     * @param debug enable debugging statementes
     * @returns boolean success
     */
    moveRelative(rowD, colD, debug = false) {
        if (!this.readyToMove)
            return false;
        if (Creature.isValidMove(rowD, colD, debug)) {
            let hexNew = this.controller.getHex(this.hex.row + rowD, this.hex.col + colD);
            if (!hexNew) {
                if (debug)
                    console.log("Destination hex does not exist");
                return false;
            }
            if (!hexNew.inArena) {
                if (debug)
                    console.log("Destination hex is not in arena");
                return false;
            }
            return this.moveToHex(hexNew);
        }
        return false;
    }
    /**
     * Checks if the target hex is occupied by a creature, if not
     * then the creature is moved to the target hex
     * @param {Tile} hex - the hex to check if it is occupied
     * @returns {boolean} - true if the creature moved, false if not
     */
    moveToHex(hex) {
        if (hex.hasCreature) {
            if (hex.creature.isAttacking || hex.creature.isMoving)
                return false;
            if (this.species.reproduction == "mate" && hex.creature.species.id == this.species.id && this.isFertile && hex.creature.isFertile) {
                this.setMate(hex);
            }
            else {
                this.setAttack(hex);
            }
            return false;
        }
        else {
            if (this.isFertile && this.species.reproduction == "mitosis") {
                this.setMitosis(hex);
            }
            else {
                this.setMovement(hex);
            }
            return true;
        }
    }
    /**
     * Apply a given animation
     * in either timed or distance modes (set distance to -1 for timed)
     * @param dist {number} - (0-1) the distance travelled relative to total distance of the journey
     */
    animate(dist, animation) {
        /**
         * Make changes to creature's data so that draw() will animate the creature
         * @param frame current frame of the animation as per instructions in animations.ts
         */
        const applyNextFrame = (frame) => {
            this.translation.x.push({ isTemporary: true, value: sequence[frame].xD * xMoveFac, source: animation });
            this.translation.y.push({ isTemporary: true, value: sequence[frame].yD * yMoveFac, source: animation });
            this.spriteSheetIndex = sequence[frame].pose;
        };
        /**
         * Start a promised based animation which will update creatue info on timeouts
         * @returns Promise
         */
        const startTimedAnimation = () => {
            return sequence.reduce((steps, stepCurr, i) => {
                return steps.then(() => {
                    applyNextFrame(i);
                    return new Promise(resolve => { setTimeout(() => resolve(), stepCurr.duration * tFac); });
                });
            }, Promise.resolve());
        };
        /**
         * Calculate the correct step of the animation for a creature based on journey progress
         * @param dist {number} - (0-1) the distance travelled relative to total distance of the journey
         */
        const continueUntimedAnimation = (dist) => {
            let distance = dist;
            if (dist > 1) {
                distance = 1;
            }
            let totalFrames = 0;
            totalFrames = sequence.reduce((prev, curr) => prev + curr.frames, totalFrames);
            let frame = distance * totalFrames;
            totalFrames = 0;
            let index = 0;
            //Find the correct step of the animation by comparing the number of "frames" elapsed to the frame allotment of each step
            while (index < sequence.length) {
                totalFrames += sequence[index].frames;
                if (frame <= totalFrames) {
                    applyNextFrame(index);
                    return;
                }
                index++;
            }
            throw "Animation Error using distance: " + dist;
        };
        //How much x/y displacment scaling
        const xMoveFac = ANIMS[animation].xTranslationScale;
        const yMoveFac = ANIMS[animation].yTranslationScale;
        //How much timeScaling
        const tFac = ANIMS[animation].timeScale;
        //Frame information
        const sequence = ANIMS[animation].steps;
        if (dist == -1) {
            startTimedAnimation();
        }
        else {
            continueUntimedAnimation(dist);
        }
    }
    /**
     * Draw creature's name
     * @param ctx canvas context
     * @param position anchor Pos
     * @returns
     */
    drawName(ctx, position) {
        if (!this.isCustom)
            return;
        let props = {
            x: position.x + CONFIG.creature.name.offset.x,
            y: position.y + CONFIG.creature.name.offset.y,
            w: CONFIG.creature.barSize.w,
            h: CONFIG.creature.barSize.h,
            font: CONFIG.creature.name.font,
            stroke: CONFIG.creature.name.stroke
        };
        ctx.textAlign = "center";
        ctx.font = 'bold ' + props.font + 'px monospace';
        ctx.lineWidth = props.stroke;
        ctx.fillStyle = CONFIG.canvas.colors.name.fill;
        ctx.strokeStyle = CONFIG.canvas.colors.name.stroke;
        ctx.strokeText(this.name.toUpperCase(), props.x + 5, props.y + props.h - 5);
        ctx.fillText(this.name.toUpperCase(), props.x + 5, props.y + props.h - 5);
    }
    /**
     * @param ctx canvas context
     * @param stat stat to map to an icon sprite name
     * @param position anchor Pos
     */
    drawIcon(ctx, stat, position) {
        let props = {
            x: position.x,
            y: position.y,
            w: CONFIG.creature.indicator.w,
            h: CONFIG.creature.indicator.h,
            font: CONFIG.creature.indicator.font,
            stroke: CONFIG.creature.indicator.stroke,
            text: this.lvl.toString()
        };
        if (stat == "xp") {
            props.y += CONFIG.creature.indicator.font / 4;
            ctx.lineWidth = props.stroke;
            ctx.textAlign = "center";
            ctx.font = 'bold ' + props.font.toString() + 'px monospace';
            ctx.fillStyle = CONFIG.canvas.colors.xp.fontFG;
            ctx.strokeStyle = CONFIG.canvas.colors.xp.fontBG;
            ctx.fillText(props.text, props.x, props.y);
            ctx.strokeText(props.text, props.x, props.y);
        }
        else {
            let icons = this.controller.get("sprite#icons");
            icons.draw(ctx, { x: props.x, y: props.y }, { w: props.w / icons.layout.w, h: props.h / icons.layout.h }, stat);
        }
    }
    /**
     * Draw a ui element with a stat bar and icon within a circle
     * @param ctx canvas context
     * @param stat StatName
     * @param position
     */
    drawIndicator(ctx, stat, position) {
        let baseline = stat == "xp" ? this.lvlXP : this.stats.base[stat];
        let statNorm = this.getStat(stat) / baseline;
        statNorm = Math.min(statNorm, 1);
        statNorm = Math.max(statNorm, 0.1);
        //for mapping the domain [1,0] to range [2*pi/4,3*pi/4]
        let props = {
            x: this.position.x + position.x + CONFIG.creature.indicator.offset.x,
            y: this.position.y + position.y + CONFIG.creature.indicator.offset.y,
            r: CONFIG.creature.indicator.r,
            cFG: CONFIG.canvas.colors[stat].FG,
            cBG: CONFIG.canvas.colors[stat].BG,
            cFont: CONFIG.canvas.colors[stat].font,
            border: CONFIG.creature.indicator.border,
            aStart: 0,
            aEnd: 2 * Math.PI * statNorm,
            aCTX: Math.PI / 2 - Math.PI * statNorm,
        };
        this.ui.fillCircle(ctx, props.x, props.y, props.r + props.border, props.cBG);
        this.ui.fillCircle(ctx, props.x, props.y, props.r + props.border, props.cFG, { start: props.aStart, end: props.aEnd, rot: props.aCTX });
        this.ui.strokeCircle(ctx, props.x, props.y, props.r + props.border, props.cBG, props.border);
        this.drawIcon(ctx, stat, props);
    }
    /**
     * Draw a standard rectangular stat bar
     * @param ctx canvas context
     * @param stat statname
     * @param position anchor Pos
     */
    drawBar(ctx, stat, position) {
        let baseline = stat == "xp" ? this.lvlXP : this.stats.base[stat];
        let statNorm = this.getStat(stat) / baseline;
        statNorm = Math.min(statNorm, 1);
        statNorm = Math.max(statNorm, 0);
        let props = {
            x: position.x + CONFIG.creature.barOffset.x,
            y: position.y + CONFIG.creature.barOffset.y,
            w: CONFIG.creature.barSize.w,
            h: CONFIG.creature.barSize.h,
        };
        ctx.beginPath();
        ctx.rect(props.x, props.y, props.w, props.h);
        ctx.fillStyle = CONFIG.canvas.colors[stat].BG;
        ctx.fill();
        ctx.strokeStyle = CONFIG.canvas.colors[stat].BG;
        ctx.stroke();
        ctx.beginPath();
        ctx.rect(props.x, props.y, statNorm * props.w, props.h);
        ctx.fillStyle = CONFIG.canvas.colors[stat].FG;
        ctx.fill();
        ctx.fillStyle = CONFIG.canvas.colors[stat].font;
        ctx.font = 'bold 24px monospace';
        ctx.fillText(stat.toUpperCase(), props.x + 5, props.y + props.h - 5);
    }
    /**
     * draw creature and its ui elements
     * called by gc on all animation frames
     * @param ctx canvas context
     * @param offset window offset
     * @param size scale
     */
    draw(ctx, offset = { x: 0, y: 0 }, size = this.size) {
        let sprite = this.controller.get("sprite#" + this.sprite);
        let position = {
            x: this.positionSprite.x + offset.x,
            y: this.positionSprite.y + offset.y
        };
        let positionSprite = {
            x: position.x + CONFIG.creature.offset.xOff,
            y: position.y + CONFIG.creature.offset.yOff
        };
        sprite.draw(ctx, positionSprite, size, this.spriteSheetIndex);
        this.drawName(ctx, position);
        this.bars.forEach((stat, i) => this.drawIndicator(ctx, stat, { x: offset.x + CONFIG.creature.indicator.r * 2 * (i + 1), y: offset.y }));
    }
}
