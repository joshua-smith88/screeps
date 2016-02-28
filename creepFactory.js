var settings = require('_Settings');
var roles = require('creepRoles');
var partsFactory = require('partsFactory');

module.exports = { 
    ProcessQueue: function (cur_room, room_spawns, room_sources, construction_sites) {
        if (cur_room.energyAvailable < settings.MIN_UNIT_ENERGY)
            return;
            
        if (cur_room.memory.harvesterCount == settings.HARVESTER_ROOM_MAX &&
            cur_room.memory.builderCount == settings.BUILDER_ROOM_MAX &&
            cur_room.memory.guardCount == settings.GUARD_ROOM_MAX)
            return;
            
        
        var spawn_energy = 0;
        for(var s in room_spawns) {
            var spawn = room_spawns[s];
            spawn_energy += spawn.energy;
        }
        for(var s in room_spawns) {
            var spawn = room_spawns[s];
            var nrg = (cur_room.energyAvailable - spawn_energy) + spawn.energy;
            var creep = {
                bodyParts: [],
                name: '',
                memory: {}
            };
        
            var creepRole;
            if (cur_room.memory.harvesterCount < settings.HARVESTER_ROOM_MAX && nrg >= settings.MIN_HARVESTER_COST)
                creepRole = roles.HARVESTER;
            else if (cur_room.memory.builderCount < settings.BUILDER_ROOM_MAX)
                creepRole = roles.BUILDER;
            else if (cur_room.memory.guardCount < settings.GUARD_ROOM_MAX)
                creepRole = roles.GUARD;
            
            if (cur_room.find(FIND_HOSTILE_CREEPS).length > 0 && cur_room.memory.guardCount < settings.GUARD_ROOM_MAX * 2)
                creepRole = roles.GUARD;

            if (creepRole) {
                creep.bodyParts = partsFactory.GetParts(creepRole, nrg);
                creep.name = GetName(creepRole);
                creep.memory = GetMemoryObj(room_sources, creepRole);
                if (spawn.canCreateCreep(creep.bodyParts) == OK)
                    spawn.createCreep(creep.bodyParts, creep.name, creep.memory);
            }
        }
    }
};

function GetName(role) {
    var result = '';
    var s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for(i = 0; i < 5; i++)
        result += s.charAt(Math.floor(Math.random() * s.length));
    
    return role.name + "_" + result;
}
function GetMemoryObj(sources, creepRole) {
    switch(creepRole) {
        case roles.HARVESTER: 
            return { role: creepRole, source: GetHarvesterSource(sources) };
            break;
        case roles.BUILDER:
            return { role: creepRole };
            break;
        case roles.GUARD:
            return {role: creepRole };
            break;
    }
}
function GetHarvesterSource(sources) {
    var i = Math.floor(Math.random() * sources.length);
    return sources[i].id;
}