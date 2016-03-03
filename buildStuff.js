var tasks = require('creepTasks');
var settings = require('_Settings');

module.exports = {
    Work: function (creep, room, spawns, sites, storages, extensions, towers) {
        if (!creep.memory.task || creep.carry.energy == 0)
            creep.memory.task = tasks.GATHER_ENERGY;
        
        //this allows units to be created when we need them by not depleting the energy stores for building
        if (room.memory.harvesterCount < settings.HARVESTER_ROOM_MAX)
            if (creep.carry.energy > 0)
                creep.task = tasks.BUILD_STRUCTURE; 
            else 
                return;
        
        if (creep.memory.task == tasks.GATHER_ENERGY)
        {
            gatherEnergy(creep, storages, extensions, spawns, towers);
            if (creep.carry.energy == creep.carryCapacity)
                creep.memory.task = tasks.BUILD_STRUCTURE;
        } else if (creep.memory.task == tasks.BUILD_STRUCTURE) {
            buildOrMove(creep, creep.memory.site);
        } else if (creep.memory.task == tasks.UPGRADE_CONTROLLER) {
            upgrade_Controller(creep);
        }

        if (creep.carry.energy == 0)
            creep.memory.task == tasks.GATHER_ENERGY;
        else if (creep.carry.energy == creep.carryCapacity)
            creep.memory.task = tasks.BUILD_STRUCTURE;
    },
    GetPreferredTarget: function(creep, sites, controller) {
        if (creep.memory.task == tasks.GATHER_ENERGY)
            return creep.memory.site;

        if (sites.length > 0)
            return sites[0];

        //if we get this far, the only thing left to upgrade is the controller
        creep.memory.tasks = tasks.UPGRADE_CONTROLLER;
        return controller;
    }
}
function upgrade_Controller(creep) {
    if (creep.upgradeController(creep.memory.site) == ERR_NOT_IN_RANGE)
        creep.moveTo(creep.memory.site);
}
function gatherEnergy(creep, storages, extensions, spawns, towers) {
    
    var allSources = storages.concat(extensions.concat(spawns.concat(towers)));
    var energySources = creep.pos.findInRange(allSources, 1);
    if (energySources.length > 0) {
        if (energySources[0].transferEnergy(creep) == OK)
            return;
    }
    
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