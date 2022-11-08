

export default {

    instructions(creature){
        //My creatures are stronger than the enemy this time
        //So my creatures can attack them
        //But I need to make sure they don't accidentally kill each other 
        
        //Tell the creature to pick a random direction to try to move in
        creature.moveRandom()

        //If the creature tries to move into an occupied hex,
        //they will attack the creature there
        //we can check if this happens with "isAttacking" which is true or false
        if(creature.isAttacking){
            //If we are attacking another creature, we can store the creature's species
            let speciesTarget = creature.target.speciesName
            let speciesFriend = creature.speciesName

            //If we are attacking a creature of our species,
            //we want to cancel the attack
            //what is wrong with this if statement?
            if(speciesTarget == speciesFriend){
                creature.moveCancel()
            }
        }

    }

}



