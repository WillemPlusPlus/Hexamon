export default {
  hex: {
    borderWidth: 2,
    radius: 62,
    margin: 2,
    angle: Math.PI / 3,
    textPositionOffset: { x: 0, y: 30 },
    textCreatureOffset: { x: 0, y: -10 },
  },
  creature: {
    size: { w: 120, h: 120 },
    offset: { xOff: 0, yOff: -40 },
    speed: 250,
    moveChance: 0.01,
    attackChance: 0.002,
    indicator: {r: 15, offset: {x:-60, y: -60}, border: 3, font: 24, stroke: 2, w:22, h:22},
    barSize: { w: 90, h: 25 },
    barOffset: { x: -30, y: -50 },
    name: {stroke: 3, font:18,offset:{ x: 0, y: 20 }},
    states: {
      idle:   {id: "idle", animation: "bounce", next: "idle"},
      move:   {id:"move",  animation: "bounce", next: "idle"},
      attack: {id:"attack",animation: "attack", next: "move"},
      mitosis:   {id: "mitosis", animation: "bounce", next: "idle"},
      mate:   {id: "mate", animation: "attack", next: "move"},
    },
    stateDefault: "idle",
  },
  food: {
    cooldown: 5,
    fertility:{rock: 10, grass:40, lush:100, water:10, sand:1},
    spawnChance: 0.00001,
    amountMin: 10,
    amountMax: 200,
    scaleFactor: 0.5,
    amounts: [10, 25, 50, 10000]
  },
  board: {
    radius: 3,
    radiusBG: 10,
  },
  canvas: {
    colors: {
      background: "#597585",
      hex: "#FFFFFF",
      hexBorder: "#215599",
      hexHighlight: "#fff",
      hexInactive: "#152b3b",
      hexSelected: "#8aaac2",
      board: "#214259",
      text: "#fff",
      creature: "#000",
      food: "#e35817",
      nrg:{FG:"#fff424",BG: "#333", fontBG:"#555", fontFG:"#FFF"},
      hp: {FG:"#51f542",BG: "#333", fontBG:"#555", fontFG:"#FFF"},
      xp: {FG:"#ff9224",BG: "#333", fontBG:"#555", fontFG:"#FFF"},
      name: {fill:"#fff", stroke:"#333"}
    },
    text: {
      font: "20px Arial",
      align: "center",
      baseline: "middle",
    },
    pip:{
      size: {w:120,h:120}
    },
    superSampling: 10
  },
  editor: {

    tools: [
      //{ id: "cursor", text: "Veiw Objects", cursor: "default" },
      //{ id: "createCreature", text: "Create Creature", cursor: "grab" },
      //{ id: "createTile", text: "Create Tile", cursor: "grab" },
      //{ id: "deleteCreature", text: "Delete Creature", cursor: "pointer" },

      { id: "spawnCustomCreature", text: "Spawn custom creature", cursor: "button" },
      { id: "spawnRandomCreature", text: "Spawn random creature", cursor: "button" },

    ],
    customise: [
      { id: "colour", text: "Choose a hue:", div: "input", tags: {type: "range",               min:"0", max:"100", value:"25", step:"any", id: "hue"}},
      { id: "colourRandomness", text: "Hue variance:", div: "input", tags: {type: "range",     min:"0", max:"100", value:"1",step:"any", id: "hueVar"}},
      { id: "sat", text: "Choose Saturation:", div: "input", tags: {type: "range",             min:"0", max:"100", value:"90",step:"any", id: "sat"}},
      { id: "satRandomness", text: "Saturation variance:", div: "input", tags: {type: "range", min:"0", max:"100", value:"1",step:"any", id: "satVar"}},
      { id: "alpha", text: "Choose Opacity:", div: "input", tags: {type: "range",              min:"0", max:"100", value:"75",step:"any", id: "alpha"}},
      { id: "alphaRandomness", text: "Opacity variance:", div: "input", tags: {type: "range",  min:"0", max:"100", value:"1",step:"any", id: "alphaVar"}},
    ],
  },

  gameController:{
    tickRate: 1/25,
    borderOcean: 1,
    creaturesStart: 16
  },

  challengeController: {
    dir: "./challenges/",
    fileExtension: ".js",
    fileSuffix: "challenge_",
    num: 1,

  },

  spriteController: {
    dir: "img/creature/",
    dirCustom: "img/creature/",
    index: ["outline","fill","lowlight","highlight"],

    customOrder: [
      {id:"eyeL", size: "small"},
      {id:"eyeR", size: "small"},
      {id:"mouth", size: "small"},
      {id:"item", size: "large"},
      {id:"hat", size: "large"},
    ],

    sprites: {
      bodyLarge: {file: "bodyLarge.png", layout: "body", num : 4},
      bodySmall: {file: "bodySmall.png", layout: "body", num : 4},
      eyes:  {file: "eyes.png", layout: "face", num : 8},
      mouth:  {file: "mouth.png", layout: "face", num : 8},
      item:  {file: "item.png", layout: "item", num : 4},
      hat:  {file: "hat.png", layout: "item", num : 8},
      icons:{file: "icons.png", layout: "icons", num : 2},
      hex:{dir: "img/hex/" , file: "hex.png", layout: "hex", num : 7},
      food:{dir: "img/hex/" , file: "food.png", layout: "food", num : 2},
    },
    defaultColours:{
      outline: "2b2b2b",
      fill: "ff3f3f",
      lowlight: "ad3535",
      highlight: "ffa8a8",
    },
    spriteSheets: {
      custom:{small:7, large:11, pad: 1},
      hex: {xOff: 0, yOff: 0, w: 128, h: 128, xMax:10, yMax:1, poses:["cliff", "rock", "lush", "grass",  "sand", "water", "ocean"]},
      icons: {xOff: 0, yOff: 0, w: 128, h: 128, xMax:2, yMax:1, poses:["nrg", "hp"]},
      body:  {xOff: 1, yOff: 0, w: 64, h: 64, xMax:4, yMax:1, poses:["idle", "ball", "fall", "plop"]},
      face:  {xOff: 0, yOff: 0, w: 8 , h: 4 , xMax:16, yMax:16},
      item:  {xOff: 0, yOff: 0, w: 16, h: 16, xMax:8, yMax:8},
      hat:  {xOff: 0, yOff: 0, w: 16, h: 16, xMax:8, yMax:8},
      food: {xOff: 0, yOff: 0, w: 138, h: 128, xMax:10, yMax:1, poses:["green", "red", "yellow"]},
    },
    buildPresets:{
      small:{
        body:{sprite:"bodySmall", offset:{x:0,y:0},   variance:{x:4,y:2}},
        eyeL:{sprite:"eyes",      offset:{x:28,y:55}, variance:{x:0,y:0}},
        eyeR:{sprite:"eyes",      offset:{x:36,y:55}, variance:{x:0,y:0}},
      },
      small_custom:{
        body:{sprite:"bodySmall", offset:{x:0,y:0},   variance:{x:4,y:2}},
        eyeL:{sprite:"eyes",      offset:{x:28,y:55}, variance:{x:0,y:0}},
        eyeR:{sprite:"eyes",      offset:{x:36,y:55}, variance:{x:0,y:0}},
      },
      large:{
        body:{sprite:"bodyLarge", offset:{x:0,y:0},   variance:{x:4,y:2}},
        eyeL:{sprite:"eyes",      offset:{x:24,y:53}, variance:{x:0,y:0}},
        eyeR:{sprite:"eyes",      offset:{x:40,y:53}, variance:{x:0,y:0}},
        mouth:{sprite:"mouth",    offset:{x:30,y:55}, variance:{x:0,y:2}},
        item:{sprite:"item",      offset:{x:22,y:42}, variance:{x:8,y:8}},
        hat:{sprite:"hat",      offset:{x:24,y:26}, variance:{x:8,y:2}},
      },
      large_custom:{
        body:{sprite:"bodyLarge", offset:{x:0,y:0},   variance:{x:4,y:2}},
        eyeL:{sprite:"eyes",      offset:{x:24,y:53}, variance:{x:0,y:0}},
        eyeR:{sprite:"eyes",      offset:{x:40,y:53}, variance:{x:0,y:0}},
        mouth:{sprite:"mouth",    offset:{x:30,y:55}, variance:{x:0,y:2}},
        item:{sprite:"item",      offset:{x:24,y:50}, variance:{x:8,y:8}},
        hat:{sprite:"hat",      offset:{x:27,y:36}, variance:{x:8,y:2}},
      },
    }


  },
  mapGenerator: {
    hex: {
      colorMapping :["#385e9c","#32a852","#f0ee89","#665b5a","#f06829","white"],
      // colorMapping :["#094d16","#147526","#2c913f","#5bb06b","#8ee89e","white"],
      radius: 200,
      margin: 0,
      border: 10,
      aa:1
    },
    radius: 10,
    n_colors: 5,
    backgroundColor: "#101010",
    collapse: {
      delay: 2,
    }
  },
  particle: {
    presets:{
      text:{size:{w:50, h:50}, sizeDelta:{dw:0.95, dh:0.95}, opacityDelta: 0.02, opacity: 0.7},
      die:{n:25, colours:["#fff", "#000"]},
      blood:{n:10, colours:["#c91e12","#5c050c"]},
      lvlup:{n:50, colours:[""]},
      food:{n:25, colours:["green", "yellow"]}
    },
  }
} as const;
