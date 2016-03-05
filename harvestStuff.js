var settings = require('_Settings');
var tasks = require('creepTasks');
var roles = require('creepRoles');

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
    var extsNeedEnergy = [];
    for(i = 0; i < extensions.length; i++)
        if (extensions[i].energy < extensions[i].energyCapacity)
            extsNeedEnergy.push(extensions[i]);
            
    if (extsNeedEnergy.length > 0) {
        var ext = creep.pos.findClosestByPath(extsNeedEnergy);
        moveOrRestock(creep, ext);
        return;
    }
    
    var towersNeedEnergy = [];
    for(i = 0; i < towers.length; i++)
        if (towers[i].energy < 500)
            towersNeedEnergy.push(towers[i]);
    if (towersNeedEnergy.length > 0) {
        var tower = creep.pos.findClosestByPath(towersNeedEnergy);
        moveOrRestock(creep, tower);
        return;
    }
        
    
    var storagesNeedEnergy = [];
    for(i = 0; i < storages.length; i++)
        if (storages[i].store.energy < storages[i].storeCapacity)
            storagesNeedEnergy.push(storages[i]);
    
    //console.log(storagesNeedEnergy.length);
    if (storagesNeedEnergy.length > 0) {
        var store = creep.pos.findClosestByPath(storagesNeedEnergy);
        moveOrRestock(creep, store);
        return;
    }
    
    var buildersNeedEnergy = [];
    var builders = room.find(FIND_MY_CREEPS, {
       filter: function(obj) {
           return obj.memory.role.value == roles.BUILDER.value;
       } 
    });
    for(i = 0; i < builders.length; i++) {
        if (builders[i].carry.energy < builders[i].carryCapacity)
            buildersNeedEnergy.push(builders[i]);
    }
    var closestBuilder = creep.pos.findClosestByPath(buildersNeedEnergy);
    if (closestBuilder != null) {
        moveOrRestock(creep, closestBuilder);
    }
    else {
        moveOrRestock(creep, creep.pos.findClosestByPath(builders));        
    }
    for (i = 0; i < towers.length; i++) {
        if (towers[i].energy < towers[i].energyCapacity) {
            moveOrRestock(creep, towers[i]);
            return;
        }
    }
}

function moveOrRestock(creep, target) {
    var result = creep.transfer(target, RESOURCE_ENERGY)
    if (result == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
    } else {
        try {
            target.memory.task == tasks.BUILD_STRUCTURE; //if we added energy, make them go back to continue building -- more efficient
            target.cancelOrder('refillEnergyOrMove');
        } catch(err) { }
    } 
        
}