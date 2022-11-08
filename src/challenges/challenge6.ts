

export default {

    instructions(creature){

        //We are surronded by enemies guarding fruits
        //One of them is weak enough to attack and kill
        //Lets use a for loop to check every direction for our target

        //This for loop is wrong
        //You'll need to figure out what our for loop should say
        for(let direction = 0; direction < 0 ;direction ++){

            //We're using the look function to get every nearby hex and check if it is occupied
            let hex = creature.look(direction)
            if(hex.hasCreature){
                //if the creature on the hex is weaker than us, attack it!
                if(hex.creature.age<creature.age){
                    creature.move(direction)
                    return 
                }
                //If the hex has no creature, move to it!
            }else{
                creature.move(direction)
                return 
            }

        }


    
    }


}



