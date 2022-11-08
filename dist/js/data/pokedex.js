export default {
    xp: {
        kill: 1000,
        dodge: 200,
        takeDamage: 50,
        dealDamage: 200,
        food: 200
    },
    stats: {
        names: ["hp", "atk", "def", "spd", "nrg"],
        min: { "hp": 10, "atk": 10, "def": 10, "spd": 10, "nrg": 10 },
        lvlFactor: 10,
        atkFactor: 1 / 2,
        defFactor: 1 / 30,
        nrgFactor: 1,
        hpRegenFactor: 1 / 20,
        hpDegenFactor: 1 / 5,
        nrgBiteFactor: 1,
        cdMin: 50 / 1000,
        cdSpdFac: 0.5,
        cdMax: 5,
        cdFertMax: 20,
        lvlMax: 99,
        lvlMin: 1,
        lvlStep: 500,
        lvlRate: 1.2,
        lvlsFertile: 10,
        lvlsPerBaby: 10,
        lvlBreakPoints: [10, 999],
        lvlNames: ["baby", "adult"],
        lvlSpritePresets: ["small", "large"],
    },
    prefixElement: {
        r: ["pyro", "heat", "vulc", "volc", "magma", "lava", "fire", "flame", "scorch", "toast", "ember", "searing", "incandescent", "blaze", "blazing", "inferno", "hellfire", "fiery", "flaming",],
        g: ["leaf", "grass", "green", "lush", "bark", "wood", "moss", "mush", "shroom", "algae", "glade", "stem", "rose", "tulip"],
        b: ["water", "ice", "cold", "frost", "hydro", "freeze", "sea", "ocean", "wave", "snow", "blizz", "chill", "blue"],
        c: ["air", "sky", "cloud", "bird", "fly", "light", "breeze", "gust", "flutter", "wind", "avian", "aerial"],
        m: ["poison", "venom", "toxin", "stink", "death", "decay", "rot", "vom", "garb", "trash", "sick"],
        y: ["Volt", "bolt", "jolt", "shock", "zap", "flash", "watt", "bolt", "thunder", "amp", "joul", "electro", "magneto", "muta"],
    },
    suffixes: {
        generic: ["anon", "amon", "agon", "atron", "eon", "on", "ion", "boy", "guy", "man", "boi", "goblin", "in", "lin", "ling", "lisk", "face", "head", "tard", "lord", "wit", "ward", "wad", "ass", "bad"]
    },
    attributes: {
        //what does the creature eat?
        diet: {
            carnivore: ["red", "yellow"], herbivore: ["green", "yellow"], omnivore: ["red", "green"]
        },
        feeding: {
            gulp: "Eats all the food on a tile instantly but is slowed while digesting",
            nibble: "Eats food on a tile slowly",
            absorb: "Once the proccess of eating is started it cannot be interupted. After a few seconds the food is eaten all at once."
        },
        //How does the creature reproduce?
        reproduction: {
            mieosis: "Two adult creatues create one or more baby creatures",
            mitosis: "An adult splits into two identical creatues",
            spores: "When an adult dies, they release many spores which develop into new creatues on nearby tiles",
            fruits: "An adult creature preiodically drops a fruit. If this fruit is eaten, a new creature grows on a nearby tile",
        },
        lifecycle: {
            cat: { lifespan: 5, offspringNumber: 5, offspringSize: 5, fertility: 5, maxSize: 5 },
            bee: { lifespan: 2, offspringNumber: 8, offspringSize: 2, fertility: 8, maxSize: 2 },
            elephant: { lifespan: 8, offspringNumber: 1, offspringSize: 5, fertility: 1, maxSize: 8 },
            rabbit: { lifespan: 4, offspringNumber: 4, offspringSize: 4, fertility: 10, maxSize: 4 },
            tardigrade: { lifespan: 10, offspringNumber: 5, offspringSize: 1, fertility: 5, maxSize: 1 },
            amoeba: { lifespan: 1, offspringNumber: 1, offspringSize: 10, fertility: 10, maxSize: 1 },
            frog: { lifespan: 3, offspringNumber: 7, offspringSize: 3, fertility: 7, maxSize: 3 },
        },
        adaptations: {
            poisonous: "When attacked, the creature will poison the attacker, dealing damage every second",
            ink: "When attacked, the creature will create a black ink cloud which slows attack speed",
            eggs: "Baby creatures live in eggs and cannot move or attack. Eggs cannot be damaged but can be eaten by carnivores",
            metamorphisis: "Baby creatures have all their stats halved but develop into adults imediatley",
            armoured: "The creature is armoured and takes less damage from attacks but is slower",
        }
    }
};
