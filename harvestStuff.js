var tasks = require('creepTasks');

module.exports = {
    Work: function (creep, room, spawns, extensions, towers, storages) {
        var source = Game.getObjectById(creep.memory.source);
        if (!creep.memory.task)
            creep.memory.task = tasks.HARVEST_RESOURCE;
        if (creep.carry.energy == 0)
            creep.memory.task = tasks.HARVEST_RESOURCE;
        
        if (creep.memory.task == tasks.HARVEST_RESOURCE) {
         	harvestResource(creep, source);
        	
        	if (creep.carry.energy >= creep.carryCapacity) {
        	    var tEnergy = 0;
    	        var tCapacity = 0;
    	        for(i = 0; i < towers.length; i++) {
    	            tEnergy += towers[i].energy;
    	            tCapacity += towers[i].energyCapacity;
    	        }
        	    
        	    if (room.energyAvailable < room.energyCapacityAvailable) {
        	        creep.memory.task = tasks.RESTOCK_RESOURCE;
        	    } else if (tEnergy < tCapacity) {
        	        creep.memory.task = tasks.FILL_TOWERS;
        	    }
        	}
        } else if (creep.memory.task == tasks.RESTOCK_RESOURCE || creep.memory.task == tasks.FILL_TOWERS) {
            restockResource(creep, room, spawns, extensions, towers, storages);
        }
    }
}

function harvestResource(creep, source) {
    if(creep.harvest(source) == ERR_NOT_IN_RANGE)
        creep.moveTo(source);
}

function restockResource(creep, room, spawns, extensions, towers, storages) {
    for (i = 0; i < spawns.length; i++) {
        if (spawns[i].energy < spawns[i].energyCapacity) {
            moveOrRestock(creep, spawns[i]);
            return;
        }
    }
    for(var i = 0; i < extensions.length; i++) {
        if (extensions[i].energy < extensions[i].energyCapacity) {
            moveOrRestock(creep, extensions[i]);
            return;
        }
    }
    for (i = 0; i < towers.length; i++) {
        if (towers[i].energy < towers[i].energyCapacity) {
            moveOrRestock(creep, towers[i]);
            return;
        }
    }
    for(i = 0; i < storages.length; i++) {
        if (storages[i].energy < storages[i].energyCapacity) {
            moveOrRestock(creep, storages[i]);
            return;
        }
    }
    
    //if we get here, there's nothing else to do but work on the controller.
    moveOrRestock(creep, room.controller);
}

function moveOrRestock(creep, target) {
    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
        creep.moveTo(target);
}