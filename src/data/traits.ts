


let trait1 = {
    name: "thorns",
    details: "When I am attacked, deal damage to my attacker",
    start: "takeDamage",
    affectEnemy: true,
    stop: function(t, n){return n<2},
    step: "everyFrame",
    effect: function(creature){
        creature.takeDamage(5)
    },
}

let trait2 = {
      name: "aquatic",
      details: "When I am on a water tile, double my speed",
      start: function(creature){
        return creature.hex.terrain == "water"
      },
      affectEnemy: false,
      stop: function(t, n){return n<2},
      step: "everyFrame",
      effect: function(creature){
        creature.boostStat("spd", 2)
      },
}
    

let trait3 = {
      name: "ambush predator",
      details: "When I am on a rock tile, double my attack",
      start: function(creature){
        return creature.hex.terrain == "rock"
      },
      affectEnemy: false,
      stop: function(t, n){return n<2},
      step: "everyFrame",
      effect: function(creature){
        creature.boostStat("atk", 2)
      },
}

let trait4 = {
    name: "poisonous",
    details: "When I am attacked, deal damage-over-time to my attacker",
    start: "takeDamage",
    affectEnemy: true,
    stop: function(t, n){return t<6},
    step: "every12Frames",
    effect: function(creature){
      creature.takeDamage(1)
    },
}

let trait5 = {
    name: "vampirism",
    details: "After I deal damage, I heal-over-time",
    start: "dealDamage",
    affectEnemy: false,
    stop: function(t, n){return t<6},
    step: "every12Frames",
    effect: function(creature){
      creature.takeDamage(-4)
    },
}

    
let trait6 = {
  name: "beserking",
  details: "After I kill a creature, I fly into an uncontrolled rage!",
  start: "dealFatalDamage",
  affectEnemy: false,
  stop: function(t, n){return t<10},
  step: "everyFrame",
  effect: function(creature){
    creature.boostStat("atk",5)
    creature.boostStat("spd",2)
    creature.moveRandom()
  },
}


let trait7 = {
  name: "protective",
  details: "For a while after reproducing, I am stronger when near babies",
  start: "onReproduce",
  affectEnemy: false,
  stop: function(t, n){return t<10},
  step: "everyFrame",
  effect: function(creature){
    let babyNearby = false
    for(let dir = 0; dir<6; dir++){
      let hex = creature.look(dir)
      if(hex.hasBaby && hex.hasFriend(creature.species)){
        babyNearby = true
      }
    }
    if(babyNearby){
      creature.boostStat("atk",2)
      creature.boostStat("def",5)
    }

  },
}


let trait8 = {
  name: "grazing",
  details: "I'm happy when there is lots of land to graze on",
  start: function(creature){
    return creature.hex.terrain == "grass"
  },
  affectEnemy: false,
  stop: function(t, n){return n<2},
  step: "every60Frame",
  effect: function(creature){
    let grassNearby = 0
    for(let dir = 0; dir<6; dir++){
      let hex = creature.look(dir)
      if(hex.terrain == "grass"){
        grassNearby += 1
      }
    }
    creature.takeDamage(-10)
  },
}


export const traits = [trait1,trait2,trait3, trait4, trait5, trait6, trait7, trait8]





