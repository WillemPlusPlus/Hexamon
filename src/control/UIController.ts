import { Tile } from "../Tile.js";
import { Entity } from "../Entity.js";
import CONFIG from "../data/config.js";
import { GameController } from "./GameController.js";
import { append } from "../utils.js";

export class UIController {
    toolSelected: string;
    infoBox: any;
    infoObject: Entity;
    infoObjectPrev: Entity;
    infoObjects: {key:string, info:string, isGameObject:boolean, object: any}[];
    watchlist: Entity[];
    controller: GameController;


    constructor(controller) {
        this.controller = controller
        this.toolSelected = "none";
        this.infoBox;
        this.infoObject;
        this.infoObjects = [];
        this.infoObjectPrev;
        this.watchlist = [];
    }



    strokeCircle(ctx:CanvasRenderingContext2D, x:number, y:number,r:number,c, s, p?:{start:number, end:number}){
        const points = p?p:{start:0,end:2 * Math.PI}
        ctx.beginPath()
        ctx.arc(x, y, r, points.start, points.end, false);
        ctx.strokeStyle = c
        ctx.lineWidth = s
        ctx.stroke();
    }
    fillCircle(ctx:CanvasRenderingContext2D, x:number, y:number,r:number,c, p?:{start:number, end:number, rot:number}){

        const points = p?p:{start:0,end:2 * Math.PI, rot:0}
        ctx.translate(x,y)
        ctx.rotate(points.rot)
        ctx.beginPath()
        ctx.arc(0, 0, r, points.start, points.end, false);
        ctx.fillStyle = c
        ctx.fill();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    getCustomiseData(){
        let settings = {
        name: "customTemplate",
        hasSprites:  true}
        CONFIG.editor.customise.forEach((setting)=>{

            let element  = document.getElementById(setting.tags.id) as HTMLInputElement
            settings[setting.tags.id] = element.valueAsNumber/100
    
        })

        return settings
    }



        /**
     * Activates the supplied tool.
     * @param {Object} tool - see config for list of tools
     */
    changeTool(tool: any) {
        this.toolSelected = tool.id
        if(tool.cursor != "button"){
            document.body.style.cursor = tool.cursor;
        }else{

            document.body.style.cursor = "default";
        }
    }

    createDialog(text, buttons){
        let root = document.getElementById("uiWrapper") as HTMLElement
        const box = append(root, "dialog", {class:"challengeDialog"})
        box.innerHTML = text
        const buttonWrapper = append(box, "div", {class:"buttonWrapper"})
        for(const button of buttons){
            const b = append(buttonWrapper, "span", {class:"toolButton"})
            b.innerHTML = button.text
            b.onclick = button.onclick
        }

        return box
    }
    
    updateChallengeInfo(title, goal, lose){
        let root = document.getElementById("challengeInfo") as HTMLElement
        root.innerHTML = ""
        append(root, "div", {class:"challengeInfoTitle"}).innerHTML = title, 
        append(root, "div", {class:"challengeInfoGoal"}).innerHTML = goal
        append(root, "div", {class:"challengeInfoLose"}).innerHTML = lose

    }

    updateChallengeTime(elementWin?, elementLose?){
        let root = document.getElementById("challengeInfo") as HTMLElement
        if(elementWin)append(root, elementWin.div, elementWin.tags)
        if(elementLose)append(root, elementLose.div, elementLose.tags)
    }

    populateChallengeBox(rootDiv, challengeController){
        append(rootDiv,"div", {id:"challengeInfo"})
        const wrapper = append(rootDiv,"div", {id:"challengeWrapper"})
        for(const challengeGroup of challengeController.challenges){
            const group = append(wrapper,"details", challengeGroup.tags)
            append(group, "summary", {class:"cgName"}).innerHTML = challengeGroup.text
            group.open = true
            for(const challenge of challengeGroup.data){
                const props  = challenge.props
                let eChallenge = append(group, "p", props.tags)
                eChallenge.innerHTML = props.text
                eChallenge.onclick = ()=>{challengeController.setChallenge([challengeGroup.index, props.index])}
            }
        }
    }

    populateCustomiseBox(root?){
        let rootDiv = root?root:document.getElementById("uiWrapper")
        let data = CONFIG.editor.customise
        let wrapper = append(rootDiv,"div", {id:"customiseWrapper"})
        append(wrapper,"div", {}).innerHTML = "Change the appearance of your custom creatures:"
        for(const datum of data){
            append(wrapper,"div", {class:"customiseLabel"}).innerHTML = datum.text
            append(wrapper, datum.div, datum.tags)

        }
        append(wrapper,"button", {id:"customiseButton", class:"toolButton"}).innerHTML = "Apply"
    }

    /**
     * Creates a div called toolBox appended to root and filled with buttons
     * for switching tools in the editor.
     * The current tool is tracked by toolSelected.
     * @param {Element} root - The parent which the UI will be built inside of.
     */
    createUI(root: HTMLElement) {
        this.infoBox = root.appendChild( document.createElement('div'));
        this.infoBox.id = 'infoBox';


        let toolBox = root.appendChild( document.createElement('div'));
        toolBox.id = "toolBox"
        for(const tool of CONFIG.editor.tools){
            let element = toolBox.appendChild(document.createElement('div'));
            element.className = 'toolButton'
            element.id = tool.id
            element.innerHTML = tool.text
            element.onclick = ()=>{this.changeTool(tool)}
        }

        let customiseBox = root.appendChild( document.createElement('div'));
        customiseBox.id = 'customiseBox';
        this.populateCustomiseBox(customiseBox)
    }



        

}