

export class Entity {
    // fields
    static id: number = 0;
    id: number;
    position: {x: number, y: number};
    velocity: {dx: number, dy: number};
    size: {w: number, h: number};
    isAlive: boolean;

    type = "Entity";


    constructor({position: {x, y} = {x: 0, y: 0},
                velocity: {dx, dy} = {dx: 0, dy: 0},
                size: {w, h} = {w: 0, h: 0}}) {
        this.id         = Entity.id++;
        this.position   = {x, y};
        this.velocity   = {dx, dy};
        this.size       = {w, h};
        this.isAlive    = true;
    }



    // methods


    // draw(ctx: CanvasRenderingContext2D) {
    //     ctx.drawImage(this.sprite,
    //         this.position.x,
    //         this.position.y,
    //         this.size.width,
    //         this.size.h);
    // }


    static repr(prop){

        const replacerFunc = (key, value) =>{
            if(typeof value === "number")return value.toFixed(1);
            if(key === "controller") return "GameController";
            if(value == null) return "null";
            if(value == undefined) return "undefined";
            if(value.id){return "#"+value.id;}
            if(value.type){return value.type;}
            return value
        }

        switch(typeof prop){
            case "string":
                return prop
            case "number":
                // round to 2 decimal places
                return prop.toString().match(/\./) ? prop.toFixed(2) : prop.toString();
            case "boolean":
                return prop.toString()
            case "object":
                if(prop == null){
                    return "null"
                }
                if(prop.hasOwnProperty("type")){
                    return prop.type
                }
                if(typeof prop[Symbol.iterator] === 'function'){
                    let string = ""
                    prop.forEach(item => {
                        string += this.repr(item)
                    })
                    return string
                }
            default:
                // return "unknown"
                return JSON.stringify(prop, replacerFunc)
        }
    }

}
