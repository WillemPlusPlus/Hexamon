

export default {

    instructions(creature){
        //When we try to move into a hex that is already occupied,
        //our  creature attacks the occupant of the hex
        
        //The other creatures are stronger than mine, so I need to avoid them
        //This line of code gets me killed :(
        creature.moveLdown()
    }

}



