import { GameController } from "./GameController.js";
import { species } from "../species/species.js";
import CONFIG from "../data/config.js";
import { range } from "../utils.js";
//Configure Hexamon:
//Create a gc and input a set of hex/creature/food starting conditions
//Does not override behaviour after setup
export class BattleController {
    gc;
    constructor() {
        this.gc = new GameController(this);
        let board = {
            hex: (hex) => {
                let border = CONFIG.gameController.borderOcean * CONFIG.hex.radius;
                return hex.x > border && hex.y > border && hex.y < window.innerHeight - border && hex.x < window.innerWidth - border;
            },
            creatures: () => {
                let creatures = [];
                let n = Math.ceil(CONFIG.gameController.creaturesStart / species.length);
                for (let s of species) {
                    range(n).forEach(() => {
                        let hex = this.gc.getRandomHex((h) => { return h.inArena && !h.hasCreature; });
                        creatures.push({ pos: { row: hex.row, col: hex.col }, species: s.id });
                    });
                }
                return creatures;
            },
            food: () => { return []; }
        };
        setTimeout(() => {
            this.gc.createBoardBiome(board);
            this.runBattle();
        }, 200);
    }
    runBattle = () => {
        this.gc.animate();
        window.requestAnimationFrame(this.runBattle);
    };
}
