export default {
    instructions(creature) {
        //We want to move around the map avoiding hexes with enemies in them
        //When we call a move function like creature.moveRandom()
        //it returns true if the creature was able to move to a new hex
        //it returns false if there isnt a hex in that direction OR if the hex is already occupied
        //Lets store the returned value
        let moveSuccesful = creature.moveRandom();
        //How do we change this if statement so that it cancels the move if it isnt good?
        if (true) {
            creature.moveCancel();
        }
    }
};
