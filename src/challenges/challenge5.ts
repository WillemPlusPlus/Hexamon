

export default {


    //instructionStart is only called once at the start of the game
    instructionsStart(creature){
        //We need to store the direction we want our creature to move it
        //So we create a new variable for our creature
        creature.direction = 4
    },

    //instruction is called every turn when the creature has nothing to do
    instructions(creature){
        //Last time, our creature moved randomly and tried to get to the fruit through luck
        //This time, the map is a little too complex for that
        //lets try to give our creature a path to follow

        //The creature.move() function takes a number as an input which represents the direction to move in (see slideshow)
        //4 means left, so the firt time we move, we move left
        let moveSuccessful = creature.move(creature.direction)

        //if our move worked, we need to change our direction
        if(moveSuccessful){
            //do something here to change our direction
        }



    
    }


}



