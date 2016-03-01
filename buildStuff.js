var tasks = require('creepTasks');
var settings = require('_Settings');

module.exports = {
    Work: function (creep, room, spawns, sites, storages, extensions, towers) {
        if (!creep.memory.task || creep.carry.energy == 0)
            creep.memory.task = tasks.GATHER_ENERGY;
        
        //this allows units to be created when we need them by not depleting the energy stores for building
        if ((room.memory.harvesterCount < settings.HARVESTER_ROOM_MAX ||
            room.memory.builderCount < settings.BUILDER_ROOM_MAX ||
            room.memory.guardCount < settings.GUARD_ROOM_PATROL) &&
            creep.memory.task == tasks.GATHER_ENERGY &&
            room.energyAvailable <= settings.MIN_HARVESTER_COST)
            return;
        
        
        if (creep.memory.task == tasks.GATHER_ENERGY)
        {
            if (room.energyAvailable <= 1 && creep.carry.energy > 0) {
                creep.memory.task = tasks.BUILD_STRUCTURE;
            } else {
                gatherEnergy(creep, storages, extensions, spawns);
                if (creep.carry.energy == creep.carryCapacity)
                {
                    creep.memory.task = tasks.BUILD_STRUCTURE;
                }
            }
        } else if (creep.memory.task == tasks.BUILD_STRUCTURE) {
            if (creep.carry.energy == 0) {
               creep.memory.task == tasks.GATHER_ENERGY;
               gatherEnergy(creep, storages, extensions, spawns);
            } else {
                buildOrMove(creep, creep.memory.site);
            }
        } else if (creep.memory.task == tasks.UPGRADE_CONTROLLER) {
            upgrade_Controller(creep);
        }
    },
    GetPreferredTarget: function(creep, sites, controller) {
        if (creep.memory.task == tasks.GATHER_ENERGY)
            return creep.memory.site;
        //need to rework this logic to prioritize properly
        //since it isn't working correctly right now, just return first site to reduce CPU
        if (sites.length > 0 && creep.memory.task != tasks.BUILD_STRUCTURE) {
            creep.memory.task = tasks.BUILD_STRUCTURE;
            return sites[0];
        } else if (sites.length > 0) {
            return sites[0];
        } else if (sites.length == 0) {
            creep.memory.task = tasks.UPGRADE_CONTROLLER;
            return controller;
        }
            
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

    }
}
function upgrade_Controller(creep) {
    if (creep.upgradeController(creep.memory.site) == ERR_NOT_IN_RANGE)
        creep.moveTo(creep.memory.site);
}
function gatherEnergy(creep, storages, extensions, spawns, towers) {
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
    for (i = 0; i < towers.length; i++) {
        if (towers[i].energy > towers[i].energyCapacity / 2) {
            refillEnergyOrMove(creep, towers[i]);
            return;
        }
    }
}
function refillEnergyOrMove(creep, target) {
    if (target.energy >= 1) {
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