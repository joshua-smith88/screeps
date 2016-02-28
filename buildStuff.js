var tasks = require('creepTasks');

module.exports = {
    Work: function (creep, room, spawns, sites, storages, extensions) {
        if (!creep.memory.task || creep.carry.energy == 0)
            creep.memory.task = tasks.GATHER_ENERGY;
        
        if (creep.memory.task == tasks.GATHER_ENERGY)
        {
            gatherEnergy(creep, storages, extensions, spawns);
            if (creep.carry.energy == creep.carryCapacity)
            {
                creep.memory.task = tasks.BUILD_STRUCTURE;
            }
        } else if (creep.memory.task == tasks.BUILD_STRUCTURE) {
            if (creep.carry.energy == 0) {
               creep.memory.task == tasks.GATHER_ENERGY;
               gatherEnergy(creep, storages, extensions, spawns);
            } else {
                buildOrMove(creep, creep.memory.site);
            }
        }
    },
    GetPreferredTarget: function(creep, sites, controller) {
        
        //need to rework this logic to prioritize properly
        //since it isn't working correctly right now, just return first site to reduce CPU
        if (sites.length > 0)
            return sites[i];

        // for(i = 0; i < sites.length; i++) {
        //     if (sites[i].structureType == STRUCTURE_SPAWN)
        //         return sites[i];
        //     if (sites[i].structureType == STRUCTURE_STORAGE)
        //         return sites[i];
        //     if (sites[i].structureType == STRUCTURE_TOWER)
        //         return sites[i];
        //     if (sites[i].structureType == STRUCTURE_EXTENSION) 
        //         return sites[i];
        //     if (sites[i].structureType == STRUCTURE_RAMPART)
        //         return sites[i];
        //     if (sites[i].structureType == STRUCTURE_WALL)
        //         return sites[i];
        //     if (sites[i].structureType == STRUCTURE_ROAD)
        //         return sites[i];
        // }
        return controller;
    }
}

function gatherEnergy(creep, storages, extensions, spawns) {
    //console.log("Builder needs to gather energy...");
    for(i = 0; i < storages.length; i++) {
        if (storages[i].energy > 0) {
            refillEnergyOrMove(creep, storages[i]);
            return;
        }
    }
    for(i = 0; i < extensions.length; i++) {
        if (extensions[i].energy > 0) {
            refillEnergyOrMove(creep, extensions[i]);
            return;
        }
    }
    for(i = 0; i < spawns.length; i++) {
        if (spawns[i].energy > 0) {
            refillEnergyOrMove(creep, spawns[i]);
            return;
        }
    }
}
function refillEnergyOrMove(creep, target) {
    if (target.energy >= 5) {
        if (target.transferEnergy(creep) == ERR_NOT_IN_RANGE)
            creep.moveTo(target);   
    } else {
        creep.moveTo(26, 26); //this prevents builders from stacking up on the spawn
    }
}
function buildOrMove(creep, targetSite) {
    if (creep.build(targetSite) == ERR_NOT_IN_RANGE)
        creep.moveTo(targetSite);
}