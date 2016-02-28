
module.exports = {
    Work: function(creep) {
    	var targets = creep.room.find(FIND_HOSTILE_CREEPS);
    
		if(targets.length) {
			if (!creep.memory.declaredAction) {
				creep.say("ATTACK!");
				creep.memory.declaredAction = true;
			}
			if(creep.attack(targets[0]) == ERR_NOT_IN_RANGE) {
				creep.moveTo(targets[0]);		
			}
		} else {
			creep.memory.declaredAction = false;
		    if (Math.abs(creep.pos.x - center.x) > 3 || Math.abs(creep.pos.y - center.y > 3)) {
		        creep.moveTo(center.x, center.y);
		    } else {
		        creep.move(pickRandomMove());
		    }
		}
    }
}

var directions = [
        TOP,
        TOP_RIGHT,
        RIGHT,
        BOTTOM_RIGHT,
        BOTTOM,
        BOTTOM_LEFT,
        LEFT,
        TOP_LEFT
    ];
var center = { x: 26, y: 26 }

var pickRandomMove = function () {
    return directions[Math.floor(Math.random() * directions.length)];
}