import { GameController } from "./control/GameController.js";
import { BattleController } from "./control/BattleController.js";
//import { SpriteController } from "./SpriteController.js";
//import { MapController } from "./MapController.js";
//import { WaveCollapseController } from "./WaveCollapseController.js";
//import { VertexSetGenerator } from "./VertexSetGenerator.js";
import { append } from "./utils.js";
const init = () => {
    //add UI to HTML
    let uiRoot = append("body", "div", { id: "uiWrapper" });
    append("body", "canvas", { id: "gameCanvas" });
    gc = new GameController();
    //create eventlisteners
    gc.canvas.onmousemove = gc.updateMousePosition;
    gc.canvas.onclick = gc.clickEvent;
    gc.ui.createUI(uiRoot);
    //wait for images to load
    setTimeout(() => {
        //Create the board
        gc.createBoard(false);
        //Start animating the board
        window.requestAnimationFrame(gc.animate);
    }, 750);
};
const initCutom = () => {
    append("body", "div", { id: "uiWrapper" });
    append("body", "canvas", { id: "gameCanvas" });
    cc = new BattleController();
};
let cc;
let gc;
//let mc: MapController;
//let wc: WaveCollapseController;
window.onload = initCutom;
