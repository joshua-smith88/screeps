var tasks = require('creepTasks');

module.exports = {
    Work: function (creep, room, spawns, extensions, towers, storages) {
        var source = Game.getObjectById(creep.memory.source);
        if (!creep.memory.task || creep.carry.energy == 0)
            creep.memory.task = tasks.HARVEST_RESOURCE;

        if (creep.memory.task == tasks.HARVEST_RESOURCE) {
            harvestResource(creep, source);
            
            if (creep.carry.energy == creep.carryCapacity) {                
                if (room.energyAvailable < room.energyCapacityAvailable) {
                    creep.memory.task = tasks.RESTOCK_RESOURCE;
                } else {
                    var tEnergy = 0;
                    var tCapacity = 0;
                    for(i = 0; i < towers.length; i++) {
                        tEnergy += towers[i].energy;
                        tCapacity += towers[i].energyCapacity;
                    }
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
    
    var builders = [];
    for(i = 0; i < Game.creeps.length; i++) {
        if (Game.creeps[i].memory.role.value == roles.BUILDER.value)
            builders.push(Game.creeps[i]);
    }
    return creep.pos.findClosestByPath(builders);
}

function moveOrRestock(creep, target) {
    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
        creep.moveTo(target);
}