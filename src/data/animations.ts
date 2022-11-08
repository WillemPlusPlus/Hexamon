export default{
    bounce:{
        id: "bounce",
        timeScale : 120,
        xTranslationScale : 40,
        yTranslationScale : 40,
        steps:[
        {pose:0,duration:1,frames:1,xD:0, yD:0},
        {pose:2,duration:1,frames:100,xD:0, yD:-1},
        {pose:1,duration:1,frames:100,xD:0, yD:-2},
        {pose:2,duration:1,frames:100,xD:0, yD:-1},
        {pose:3,duration:1,frames:100,xD:0, yD:0},
        {pose:0,duration:1,frames:1,xD:0, yD:0},
        ]
    },
    attack:{
        id: "attack",
        timeScale : 80,
        xTranslationScale : 40,
        yTranslationScale : 40,
        steps:[
            {pose:0,duration:1,frames:1,xD:0, yD:0},
            {pose:2,duration:1,frames:100,xD:0, yD:-1},
            {pose:1,duration:1,frames:100,xD:0, yD:-2},
            {pose:2,duration:1,frames:100,xD:0, yD:-3},
            {pose:3,duration:1,frames:100,xD:0, yD:-2},
            {pose:0,duration:1,frames:5,xD:0, yD:-1},

        ]

    }
}