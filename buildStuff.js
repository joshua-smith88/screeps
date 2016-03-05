var tasks = require('creepTasks');
var settings = require('_Settings');

module.exports = {
    Work: function (creep, room, spawns, sites, storages, extensions, towers) {
        var storageEnergy = 0;
        for(i = 0; i < storages.length; i++) {
            storageEnergy += storages[i].store.energy;
        }
        
        if (!creep.memory.task || creep.carry.energy == 0)
            creep.memory.task = tasks.GATHER_ENERGY;
        
        //this allows units to be created when we need them by not depleting the energy stores for building
        if (Memory.harvesterCount < sources.length * settings.HARVESTERS_PER_SOURCE && storageEnergy == 0 && spawns.length > 0)
            if (creep.carry.energy > 0)
                creep.task = tasks.BUILD_STRUCTURE; 
            else 
                return;
        
        if (creep.memory.task == tasks.GATHER_ENERGY)
        {
            gatherEnergy(creep, storages, extensions, spawns, towers);
            if (creep.carry.energy == creep.carryCapacity)
                creep.memory.task = tasks.BUILD_STRUCTURE;
        } else if (creep.memory.task == tasks.UPGRADE_CONTROLLER) {
            upgrade_Controller(creep);
        } else if (creep.memory.task == tasks.BUILD_STRUCTURE) {
            buildOrMove(creep, creep.memory.site);
        } 

        if (creep.carry.energy == 0)
            creep.memory.task == tasks.GATHER_ENERGY;
    },
    GetPreferredTarget: function(creep, sites, controller) {
        if (creep.memory.task == tasks.GATHER_ENERGY || creep.carry.energy == 0)
            return creep.memory.site;

        if (sites.length > 0 && creep.carry.energy > 0 && creep.memory.task != tasks.GATHER_ENERGY) {
            creep.memory.task = tasks.BUILD_STRUCTURE;
            return creep.pos.findClosestByPath(sites);
        }
        
        //if we get this far, the only thing left to upgrade is the controller
        creep.memory.task = tasks.UPGRADE_CONTROLLER;
        return controller;
    }
}
function upgrade_Controller(creep) {
    if (creep.upgradeController(creep.memory.site) == ERR_NOT_IN_RANGE)
        creep.moveTo(creep.memory.site);
}
function gatherEnergy(creep, storages, extensions, spawns, towers) {
    var sourcesWithEnergy = [];
    if (storages.length > 0)
        for(i = 0; i < storages.length; i++)
            if (storages[i].store.energy > 0)
                sourcesWithEnergy.push(storages[i]);
    var storage = creep.pos.findClosestByPath(sourcesWithEnergy);
    
    if (storage !== null) {
        refillFromStorageOrMove(creep, storage)
        return;
    }
    
    if (extensions.length > 0)
        for(i = 0; i < extensions.length; i++)
            if (extensions[i].energy > 0)
                sourcesWithEnergy.push(extensions[i]);
                
    var source = creep.pos.findClosestByPath(sourcesWithEnergy);
    if (source !== null)
        refillEnergyOrMove(creep, source);
    return;
}
function refillEnergyOrMove(creep, target) {
    if (target.energy > 0) {
        if (target.transferEnergy(creep) == ERR_NOT_IN_RANGE)
            creep.moveTo(target);   
    }
}
function refillFromStorageOrMove(creep, target) {
    if (target.store.energy > 0) {
        if (target.transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            creep.moveTo(target);
    }
}
function buildOrMove(creep, targetSite) {
    if (creep.build(targetSite) == ERR_NOT_IN_RANGE)
        creep.moveTo(targetSite);
}