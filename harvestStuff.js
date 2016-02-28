module.exports = function (creep, roomController, harvestSource, myExts) {
    //console.log('harveststuff');
    var sEnergy = Game.spawns.MOTHERLAND.energy;
    var sCapacity = Game.spawns.MOTHERLAND.energyCapacity;
    var creepEnergy = creep.carry.energy;
    var creepCapacity = creep.carryCapacity;
    var upgradeControllerOnly = (sEnergy === sCapacity) && (creepEnergy > 0);
    
    var builderCreep = false;
    if (creep.memory.role.name == 'builder')
        builderCreep = true;
    
    var selectedExt;
    for (var i in myExts) {
        if (myExts[i].energy < myExts[i].energyCapacity) {
            selectedExt = myExts[i];
            break;
        }
    }
    if (selectedExt != null)
        upgradeControllerOnly = false;
    
    if (builderCreep === true) {
        upgradeCtl(creep, roomController);
    } else if (upgradeControllerOnly) {
        upgradeCtl(creep, roomController);
    } else if (creepEnergy < creepCapacity) {   
        harvestEnergy(creep, harvestSource);
	} else if (sEnergy < sCapacity) {
	    restockSpawns(creep, sEnergy, sCapacity, myExts);
	} else if (selectedExt != null) {
	    restockExtensions(creep, selectedExt);
	}
}

var upgradeCtl = function (creep, roomController) {
    if (creep.carry.energy === 0) {
        if (Game.spawns.MOTHERLAND.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.spawns.MOTHERLAND);
        } 
    } else {
        if (creep.upgradeController(roomController) == ERR_NOT_IN_RANGE) {
            creep.moveTo(roomController)
        }
    }
}

var restockSpawns = function (creep, sEnergy, sCapacity, exts) {
    //if we dont have full energy in the spawn, deliver there
    if (sEnergy < sCapacity) {
        if (creep.transfer(Game.spawns.MOTHERLAND, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
	        creep.moveTo(Game.spawns.MOTHERLAND);
    }
}
var restockExtensions = function (creep, ext) {
    if (creep.transfer(ext, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
        creep.moveTo(ext);
}

var harvestEnergy = function (creep, harvestSource) {
	if(creep.harvest(harvestSource) == ERR_NOT_IN_RANGE) {
		creep.moveTo(harvestSource);
	}
}