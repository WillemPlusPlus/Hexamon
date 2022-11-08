/**
 * Python style range():
 * Create an array of numbers following some start/stop/step patter 
 * @param a int
 * @param b int
 * @param c int
 * @returns array
 */
export const  range = (a,b?,c?):Array<number> => {
    let start = 0
    let stop = -1
    let step = 1
    if(c){
        start = a
        stop = b
        step = c
    }else if(b){
        start = a
        stop = b
        step  = 1
    }else{
        start = 0
        stop = a
        step = 1
    }
    let arr = [];
    for (let i = Math.floor(start); i < Math.floor(stop); i+=Math.floor(step)) {
        arr.push(i);
    }
    return arr
}



/**
 * Random Integer between 0 and length-1
 * @param length Integer - the length of the array ect.
 * @returns Random Integer between 0 and length-1
 */

export const rand = (length) => {
    return Math.floor(Math.random()*length);
}

/**
 * Get a random element from an array
 * @param iterable 
 * @returns element
 */
export const randElement = (iterable) => {
    return iterable[rand(iterable.length)];
}

/**
 * Create a deep copy of an object
 * @param obj Object
 * @param isArr Enable nested Array deep copy
 * @returns object copy
 */
export const copy = (obj: any, isArr:boolean=false) => {
    // return obj.slice();
    if (typeof obj !== 'object') {
        return obj;
    }

    if(isArr){
        let arr = obj as any[];
        return arr.map(o => copy(o, true))
    }
    else {
        return JSON.parse(JSON.stringify(obj));
    }
}

/**
 * Euclidian 2D distance
 * @param pos1 {x:num,y:num}
 * @param pos2 {x:num,y:num}
 * @returns num
 */
export const dist = (pos1,pos2) => {
    return Math.sqrt(Math.pow(pos1.x-pos2.x,2)+Math.pow(pos1.y-pos2.y,2));
}

/**
 * DOM manipulation: append child to parent element
 * @param parent parent node
 * @param child child type string
 * @param childProps html tags props object
 * @returns child node
 */
export const append = (parent: string|HTMLElement, child:string, childProps?: any) => {
    let eParent
    if(typeof parent === "string"){
        eParent = (parent == "body")?document.body:document.getElementById(parent)
    }
    if(typeof parent === "object"){
        eParent = parent
    }
    const eCurr = document.getElementById(childProps.id)
    if(eCurr){eCurr.remove()}

    const eChild = eParent.appendChild(document.createElement(child));
    if(!childProps)return eChild
    for (const [k,v] of Object.entries(childProps)) {
        eChild.setAttribute(k as string, v as string);
    }
    return eChild;
}

/**
 * Are p1 and p2 within range of eachother
 * @param p1 {x:num,y:num}
 * @param p2 {x:num,y:num}
 * @param range number
 * @returns bool
 */
export const isWithinRange = (p1, p2, range) => {
    return Math.abs(p1.row - p2.row) <= range && Math.abs(p1.col - p2.col) <= range && Math.abs((p1.row - p1.col) - (p2.row - p2.col)) <= range;
};


