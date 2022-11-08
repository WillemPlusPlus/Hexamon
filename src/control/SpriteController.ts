
import CONFIG from "../data/config.js";
import { rand, range, append} from "../utils.js";
import {species} from "../species/species.js"
const DATA = CONFIG.spriteController

export class SpriteController{
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    canvasSecret: HTMLCanvasElement;
    sprites: Map<string, Sprite>;
    spriteIDNext:number;
    spriteIDStatic:string[]

    constructor(){

        //A canvas for image manipulation
        this.canvasSecret = append("body", "canvas", {class:"offscreen"})as HTMLCanvasElement;
        this.canvasSecret.style.display = "none";

        this.canvasSecret.width = 500;
        this.canvasSecret.height = 500


        //Store all pre-baked sprites in a map
        this.sprites = new Map<string, Sprite>();
        this.spriteIDNext = 0;
        this.spriteIDStatic = Object.keys(CONFIG.spriteController.sprites)

        for(const id of this.spriteIDStatic){
            let image = new Image();
            let fp = (DATA.sprites[id].dir?DATA.sprites[id].dir:DATA.dir) + DATA.sprites[id].file

            image.src = fp
            let sprite = new Sprite(id,image,DATA.sprites[id].layout)
            this.sprites.set(id, sprite)
            
        }

        for(let spec of species){
            this.getCustomAssets(spec.appearance.file)
        }


    }

    getNewSpriteID(){
        return (this.spriteIDNext++).toString();
    }

    has(id){
        return this.sprites.has(id)
    }

    get(id){
        return this.sprites.get(id)
    }

    /**
     * Calcualte the posistions to add a sprite on every sprite of a spritesheet
     * @param base sprite to use
     * @param xOff x offset
     * @param yOff y offsetb
     * @returns 
     */
    getSpritePositions(base:Sprite, offset:{x:number, y:number}, random:{x:number, y:number}){
        const yAdjust = [0, -6, -6, +2]
        return range(DATA.sprites[base.id].num).map(i=>{
            let x = i
            let y = 0

            return {x:x*base.layout.w+offset.x+random.x,y:y*base.layout.h+offset.y+yAdjust[i]+random.y}
        })

    }

    getCustomAssets(name:string){
        const fp = DATA.dirCustom + name + ".png"
        const id = "assets_"+name
        let image = new Image();
        image.src = fp
        let sprite = new Sprite(id,image, "custom")
        this.sprites.set(id, sprite)
    }

    /**
     *  Apply a palette to an image and turn the resulting image into a sprite object
     * @param idBase base image to use
     * @param idNew ID of the new sprite
     * @param idSheet ID of the sprite sheet format the sprite will use
     */
    generateSprite(customSettings:any, idPreset:string = "large", idSheet:string = "body", indexRolls?: any){
        let spriteCustom = this.sprites.get("assets_"+customSettings.file)
        const preset = DATA.buildPresets[idPreset]
 
        let sprite  = this.sprites.get(preset.body.sprite)
        let partIndex = indexRolls? indexRolls:{}
        let spriteElement = sprite.image
        let w = spriteElement.width
        let h = spriteElement.height

        //set secret canvas to img dimensions
        this.canvasSecret.width = w;
        this.canvasSecret.height = h;
        let ctx = this.canvasSecret.getContext('2d');
        //Convert base image to imageData then to img object
        ctx.drawImage(spriteElement,0,0,w,h)
        let img1d = ctx.getImageData(0,0,w,h)
        let img = new Img()
        img.importData(img1d)
        img.setPalette(customSettings)
        img.applyPalette()

        let r = (n) => Math.floor(Math.random()*n-n/2)
        let xOffFace = r(preset.body.variance.x)
        let yOffFace = r(preset.body.variance.y)
        
        let spritePart
        type partType = {sprite:string, offset:{x:number, y:number}, variance:{x:number, y:number}, isPair:boolean}
        for(const [k, v] of Object.entries(preset)){
            if(k == "body") continue;
            const part = v as partType
            let isPair = false
            let index = 0
            let onTop = true
            let xOff = r(part.variance.x)
            let yOff = r(part.variance.y)
            if(k == "eyeL" || k == "eyeR")   isPair = true;
            if(k == "item")  onTop = false;
            if(k == "eyeL" || k == "eyeR" || k == "mouth"){
                xOff += xOffFace
                yOff += yOffFace
            }

            if(customSettings.file){
                spritePart = spriteCustom.getPart(k)
            }else{
                if(k != "eyeR"){spritePart =this.sprites.get(part.sprite).getRandom(isPair, partIndex[k])}
                else{index = 1;}
            }
            let positions = this.getSpritePositions(sprite, part.offset, {x:xOff, y:yOff})
            img.pasteData(spritePart.data[index] ,positions ,onTop)
            partIndex[k] = spritePart.index
        }

        //Save the new image to the library
        this.canvasSecret.width = w;
        this.canvasSecret.height = h;
        img1d = img.exportData(img1d)
        ctx.putImageData(img1d, 0, 0);
        let imgElement = new Image()
        imgElement.src = this.canvasSecret.toDataURL('image/png')
        //Create Sprite
        let idSprite = this.getNewSpriteID()
        this.sprites.set(idSprite, new Sprite(idSprite,imgElement,idSheet,partIndex))

        return idSprite
    }
}
export class Sprite{
    id: string;
    image: HTMLImageElement;
    canvasSecret: HTMLCanvasElement;
    layout: any;
    partIndex: any;

    constructor(id: string, image: HTMLImageElement, idSheet: any, indexs?:any){
        //A canvas for image manipulation
        this.canvasSecret = append("body", "canvas", {class:"offscreen"})as HTMLCanvasElement;
        this.canvasSecret.style.display = "none";
        this.id = id;
        this.layout = DATA.spriteSheets[idSheet];
        this.image = image
        this.partIndex = indexs
    }

    /**
     * 
     * @param ctx The canvas context to draw on
     * @param pos position to draw the sprite (center) x,y
     * @param scale scaling factor w,h
     * @param imgs image library
     * @param index index of sprite image within image element
     */
    draw(ctx:CanvasRenderingContext2D,pos:{x:number, y:number},scale:{w:number, h:number},index:(number|string) = 0, scaleAbsolute = false){
        let ix
        if(typeof index == "number"){
            ix = index
        }else{
            ix = this.layout.poses.indexOf(index)
        }

        let iy = 0
        let sx = ix*this.layout.w+this.layout.xOff
        let sy = this.layout.xOff+iy*this.layout.h+this.layout.yOff
        let sw = this.layout.w
        let sh = this.layout.h
        let dx, dy, dw, dh
        if(scaleAbsolute){
            dx = pos.x-scale.w/2
            dy = pos.y-scale.h/2
            dw = scale.w
            dh = scale.h
        }else{
            dx = pos.x-this.layout.w*scale.w/2
            dy = pos.y-this.layout.h*scale.h/2
            dw = this.layout.w*scale.w
            dh = this.layout.h*scale.h
        }



        ctx.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh)
    }

    getPart(id:string): {index:number, data:ImageData[]}{

        let wImage = this.image.width

        let x = this.layout.pad
        let y = this.layout.pad
        let size = DATA.customOrder[0].size as string
        let w = this.layout[size]
        let h = this.layout[size]

        let i = 0
        let partID = DATA.customOrder[i].id
        while(partID != id){
            i++
            partID = DATA.customOrder[i].id
            size   = DATA.customOrder[i].size
            w = this.layout[size]
            h = this.layout[size]
            x = x + w + this.layout.pad

            if((x+w) > wImage){
                x  = this.layout.pad
                y += h  
            }
        } 

        this.canvasSecret.width = w;
        this.canvasSecret.height = h;
        let ctx = this.canvasSecret.getContext('2d');
        ctx.clearRect(0,0,this.layout.w,this.layout.h)
        ctx.drawImage(this.image,
            x,y,w,h,
            0,0,w,h)

        return {index:0,data:[ctx.getImageData(0,0,w,h),ctx.getImageData(0,0,w,h)]}
    }

    /**
     * return a random sprite from the sprite sheet as a imageData object
     * @param isPair If the sprite comes in pair, return each
     * @returns an array of sprite imageData objects contains 2 images if isPair
     */
    getRandom(isPair:boolean, index: number): {index:number, data:ImageData[]}{
        let id = index?index:rand(DATA.sprites[this.id].num)
        let x = id
        let y = 0
        //set secret canvas to img dimensions
        this.canvasSecret.width = this.layout.w;
        this.canvasSecret.height = this.layout.h;
        let ctx = this.canvasSecret.getContext('2d');
        ctx.clearRect(0,0,this.layout.w,this.layout.h)
        ctx.drawImage(this.image,
            x*this.layout.w, y*this.layout.h, this.layout.w, this.layout.h,
            0,0,this.layout.w,this.layout.h)
        if(isPair){
            return {index:id, data:[ctx.getImageData(0,0,this.layout.w/2,this.layout.h),ctx.getImageData(this.layout.w/2,0,this.layout.w,this.layout.h)]}
        }else{
            return {index:id, data:[ctx.getImageData(0,0,this.layout.w,this.layout.h)]}
        }

    }



}

export class Img{
    palette: any;
    colours: string[];
    coloursWeb: string[];
    data: { r: number[][]; g: number[][]; b: number[][]; a: number[][]; };
    
    constructor(){
        this.colours = ["r","g","b","a"]
        this.coloursWeb = ["r","g","b"]
        this.data = {r:[],g:[],b:[],a:[]}
        this.palette = {}
    }

    /**
     * save each channel seperatley, preserving xy info
     * @param imgData The image data to import
     */
    importData(imgData: ImageData){
        this.colours.forEach((col,coli)=>{
            const colour1d = imgData.data.filter((data: any,datai: number)=>datai%4==coli)
            this.data[col] = this.arrayTo2d(colour1d,imgData.width,imgData.height)
        })
    } 

    validatePos(x,y){
            return this.data.a.length   <=y
            ||     this.data.a[0].length<=x
            ||                        x < 0
            ||                        y < 0
    }

    denorm(v, range, domain = [0,1]){
        let value = v>=0?v:0
            value = value<=1?value:1
            return (value-domain[0])*range[1]/(domain[1]-domain[0])
    }


    /**
     * blend the image with another image at the given postions
     * @param imgData Image to be pasted
     * @param positions places to paste
     * @param onTop paste on top or bottom?
     */
    pasteData(imgData: ImageData, positions: {x:number, y: number}[], onTop = true){
        const colours1d = this.colours.map((c,i)=>imgData.data.filter((data: any,datai: number)=>datai%4==i))
        const colours2d = colours1d.map(colour1d=>this.arrayTo2d(colour1d,imgData.width,imgData.height))
        let pixelTop, pixelBot, alphaTop, alphaBot
        for(let x = 0; x < imgData.width; x++){
            for(let y = 0; y < imgData.height; y++){
                for(let pos of positions){
                    if(this.validatePos(pos.x+x,pos.y+y))continue;
                    const alphaOld = (this.data["a"][pos.y+y][pos.x+x])/255
                    let alphaNew = -1
                    this.coloursWeb.forEach((col,coli)=>{
                        if(alphaNew = -1) alphaNew = colours2d[3][y][x]/255;
                        const pixelOld = this.data[col][pos.y+y][pos.x+x]
                        const pixelNew = colours2d[coli][y][x]
                        if(onTop){
                            pixelTop = pixelNew
                            pixelBot = pixelOld
                            alphaTop = alphaNew
                            alphaBot = alphaOld
                        }else{
                            pixelTop = pixelOld
                            pixelBot = pixelNew
                            alphaTop = alphaOld
                            alphaBot = alphaNew
                        }
                        if(alphaBot==0){pixelBot=pixelTop}
                        const pixel = Math.floor(alphaTop * pixelTop + ((1-alphaTop)*pixelBot))
                        this.data[col][pos.y+y][pos.x+x] = pixel
                    })
                    const alpha = alphaTop + (1-alphaTop)*alphaBot
                    this.data["a"][pos.y+y][pos.x+x] = Math.floor(alpha*255)
                }
            }
        }
    }

    /**
     * 
     * @param h hue 0 to 360 degrees
     * @param s satutaion 0-1
     * @param v value 0-1
     * @returns {r: number, g: number, b: number}
     * https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB
     */
    static hsvToRgb(hsv:{h: number, s: number, v: number}, hsvMod:{h: number, s: number, v: number} = {h:0,s:0,v:0}){
        let h,s,v
        [h,s,v] = [hsv.h+hsvMod.h,hsv.s+hsvMod.s,hsv.v+hsvMod.v]

        h = h%360
        s = Math.max(0,Math.min(s,1))
        v = Math.max(0,Math.min(v,1))

        const chroma = v * s
        const hPrime = h / 60
        const x = chroma * (1 - Math.abs(hPrime % 2 - 1))
        let rgb = [x, chroma,0]
        if(Math.floor(hPrime)%2){
            rgb = [chroma, x, 0]
        }
        if(hPrime>2){
            let lastToFist = rgb.pop()
            rgb.unshift(lastToFist)
        }
        if(hPrime>4){
            let lastToFist = rgb.pop()
            rgb.unshift(lastToFist)
        }
        const m = v - chroma
        let result = {r: Math.floor(255*(rgb[0] + m)), g: Math.floor(255*(rgb[1] + m)), b: Math.floor(255*(rgb[2] + m))}
        return result
    }




    /**
     * @param x x coordinate of pixel
     * @param y y coordinate of pixel
     * @returns hexadecimal colour string (no #)
     */
    rgbaToHex(x: number,y: number){
        let hexCode = ""
        this.coloursWeb.forEach((col,coli)=>hexCode = hexCode + (this.data[col][y][x].toString(16).padStart(2,"0")))
        return hexCode
    }

    /**
     * Apply a palette mapping to a pixel
     * @param x coordinate of pixel
     * @param y coordinate of pixel
     */
    colourPixel(x: number,y: number){
        let colNew = this.palette[this.rgbaToHex(x,y)]
        colNew = (colNew?colNew:{r:0,g:0,b:0})
        this.coloursWeb.forEach((col)=>{this.data[col][y][x] = colNew[col]})
        let alpha = this.data["a"][y][x]
        if(alpha != 0 && alpha != 255){
            alpha =  alpha *  Number(this.palette["alpha"])
            alpha = Math.max(Math.min(alpha,255),0)
        }
        this.data["a"][y][x] = alpha
    }

    /**
     * get the palette mapping
     */
    setPalette(settings: any){
        const index = DATA.index
        let colours = {}
        let palette = {}
        let alphaMod = 1


        let colourBase
        if(!settings){
            alphaMod = Math.random() + 0.5
            colourBase = {h:Math.random()*360,s:Math.random()*0.2+0.6,v:1}
        }else{
            let hueNew = settings["hue"]
            hueNew = this.denorm(hueNew, [0,350])
            let satNew = (settings["sat"])
            satNew = this.denorm(satNew, [0.1,1])
            alphaMod = (settings["alpha"]  )
            alphaMod = this.denorm(alphaMod, [0.1,1])
            colourBase = {h:hueNew,s:satNew,v:1}
        }



        const outline   = Img.hsvToRgb(colourBase,{h:0,s:0,v:-0.6})
        const fill      = Img.hsvToRgb(colourBase,{h:0,s:0,v:0})
        const highlight = Img.hsvToRgb(colourBase,{h:0, s:-0.2, v:0})
        const lowlight  = Img.hsvToRgb(colourBase,{h:0, s:0, v:-0.2})
        colours = {outline,fill,highlight,lowlight}
        index.forEach((col,coli)=>{
            palette[this.rgbaToHex(0,coli)] = colours[col]
        })
            

    

        palette["alpha"] = alphaMod
        this.palette = palette;
    }

    /**
     * colour every pixel according to the palette
     */
    applyPalette(){
        for(const row of range(this.data.r.length)){
            for(const col of range(this.data.r[0].length)){
                this.colourPixel(col, row)
            }
        }

    }

    /**
     * convert the imgData.data to the new palatte
     * @param imgData The imageData object
     * @returns The imageData object
     */
    exportData(imgData: ImageData){
        for(const row of range(imgData.height)){
            for(const col of range(imgData.width)){
                this.colours.forEach((c,i)=>{
                    imgData.data[4*row*imgData.width+4*col+i] = this.data[c][row][col]
            })
            }
        }
        return imgData
    }

    /**
     * @param arr array of numbers
     * @param w width of array
     * @param h height of array
     * @returns array of array of numbers
     */
    arrayTo2d(arr: any,w: number,h: number){
        let arr2d = []
        for(const row of range(h)){
            arr2d.push(arr.slice(row*w,(row+1)*w))
        }
        return arr2d
    }

}