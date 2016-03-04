var tasks = require('creepTasks');
var settings = require('_Settings');

module.exports = {
    Work: function (creep, room, spawns, sites, storages, extensions, towers) {        
        //this allows units to be created when we need them by not depleting the energy stores for building
        if (room.memory.harvesterCount < settings.HARVESTER_ROOM_MAX && creep.carry.energy == 0)
            return;

        if (sites.length > 0)
            buildOrMove(creep, sites[0]);
        else 
            upgrade_Controller(creep);

        //Try to get some energy
        if (creep.carry.energy == 0)
            gatherEnergy(creep, storages, extensions, spawns, towers);
    },
    GetPreferredTarget: function(creep, sites, controller) {
        if (sites.length > 0)
            return sites[0];
        
        return controller;
    }
}
function gatherEnergy(creep, storages, extensions, spawns, towers) {
    var allSources = storages.concat(extensions.concat(spawns.concat(towers)));
    var energySources = creep.pos.findInRange(allSources, 1);
    if (energySources.length > 0)
        energySources[0].transferEnergy(creep);
}
function upgrade_Controller(creep) {
    if (creep.upgradeController(creep.memory.site) == ERR_NOT_IN_RANGE)
        creep.moveTo(creep.memory.site);
}
function buildOrMove(creep, targetSite) {
    if (creep.pos.findPathTo(targetSite).length > 1)
        creep.moveTo(targetSite);

    if (creep.build(targetSite) == ERR_NOT_IN_RANGE)
        creep.moveTo(targetSite);
}