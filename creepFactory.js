var settings = require('_Settings');
var roles = require('creepRoles');

module.exports = { 
    ProcessQueue: function (my_creeps, cur_room, room_spawns, room_sources, construction_sites) {
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
            if (cur_room.memory.harvesterCount == 0 && nrg <= settings.MIN_UNIT_ENERGY) //this is our baby harvester.
                creepRole = roles.HARVESTER;
            else if (cur_room.memory.harvesterCount < settings.HARVESTER_ROOM_MAX && nrg >= settings.MIN_HARVESTER_COST)
                creepRole = roles.HARVESTER;

            if (cur_room.memory.harvesterCount >= settings.HARVESTER_ROOM_MAX) {
                if (cur_room.memory.builderCount < settings.BUILDER_ROOM_MAX && nrg >= settings.MIN_BUILDER_COST)
                    creepRole = roles.BUILDER;
                if (cur_room.memory.builderCount == settings.BUILDER_ROOM_MAX) {
                    if (cur_room.memory.guardCount < settings.GUARD_ROOM_PATROL && nrg >= settings.MIN_GUARD_COST)
                        creepRole = roles.GUARD;
                }
            }
            
            //if we are under attack, prioritize building more guards, and build up to the room max
            if (cur_room.find(FIND_HOSTILE_CREEPS).length > 0 && cur_room.memory.guardCount < settings.GUARD_ROOM_MAX)
                creepRole = roles.GUARD;

            if (creepRole === undefined)
                return; //dont build anything, no role was a match

            creep.bodyParts = GetParts(creepRole, nrg);
            creep.name = GetName(creepRole);
            creep.memory = GetMemoryObj(my_creeps, room_sources, creepRole);
            if (spawn.canCreateCreep(creep.bodyParts) == OK) {
                spawn.createCreep(creep.bodyParts, creep.name, creep.memory);
                switch(creep.memory.role.value) {
                    case roles.HARVESTER.value:
                        cur_room.memory.harvesterCount++;
                        break;
                    case roles.BUILDER.value:
                        cur_room.memory.builderCount++;
                        break;
                    case roles.GUARD.value:
                        cur_room.memory.guardCount++;
                        break;
                }
            }
        }
    }
};

function getHarvesterSource (creeps, sources) {
    if (creeps === undefined || creeps.length == 0) {
        return sources[0].id;
    } else {
        var resultCount = creeps.length;
        var resultSource = '';
        
        for(i = 0; i < sources.length; i++) {
            var sourceId = sources[i].id;
            var count = 0;
            for(j = 0; j < creeps.length; j++) {
                if (sourceId == creeps[j].memory.source)
                    count++;
            }
            if (count < resultCount) {
                resultCount = count;
                resultSource = sourceId;
            } 
            count = 0;
        }
        return resultSource;
    }

    // var i = Math.floor(Math.random() * sources.length);
    // return sources[i].id;
}

function GetMemoryObj(creeps, sources, creepRole) {
    switch(creepRole) {
        case roles.HARVESTER: 
            return { role: creepRole, source: getHarvesterSource(creeps, sources) };
            break;
        case roles.BUILDER:
            return { role: creepRole };
            break;
        case roles.GUARD:
            return {role: creepRole };
            break;
    }
}
function GetParts(role, nrg) {
    switch(role) {
        case roles.HARVESTER:
            return getHarvesterParts(nrg);
        case roles.BUILDER:
            return getBuilderParts(nrg);
        case roles.GUARD:
            return getGuardParts(nrg);
    }
}
function GetName(role) {
    var result = '';
    var s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for(i = 0; i < 5; i++)
        result += s.charAt(Math.floor(Math.random() * s.length));
    
    return role.name + "_" + result;
}

function getBuilderParts(nrg) {
    if (nrg >= 250 && nrg < 300) 
        return [WORK, CARRY, MOVE];
    if (nrg >= 300 && nrg <= 350)
        return [WORK, WORK, CARRY, MOVE];
    else if (nrg >= 350 && nrg <= 400)
        return [WORK, WORK, CARRY, CARRY, MOVE];
    else if (nrg >= 450 && nrg < 550)
        return  [WORK, WORK, WORK, CARRY, CARRY, MOVE];
    else if (nrg >= 550 && nrg < 650)
        return [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE];
    else if (nrg >= 650 && nrg < 750)
        return [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE];
    else if (nrg >= 750)
        return [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE];
}

function getHarvesterParts(nrg) {
    if (nrg >= 250 && nrg <= 300)
        return [WORK, CARRY, MOVE, MOVE];
    else if (nrg >= 350 && nrg <= 400)
        return [WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
    else if (nrg >= 450 && nrg < 500)
        return  [WORK, WORK, CARRY, MOVE, MOVE, MOVE];
    else if (nrg >= 500 && nrg < 650)
        return [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
    else if (nrg >= 650 && nrg < 750)
        return [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
    else if (nrg >= 750)
        return [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
}

function getGuardParts(nrg) {
    if (nrg >= 190 && nrg < 250)
        return [ATTACK, TOUGH, MOVE, MOVE];
    else if (nrg >= 250 && nrg < 330)
        return [ATTACK, TOUGH, TOUGH, MOVE, MOVE, MOVE];
    else if (nrg >= 330 && nrg < 390)
        return [ATTACK, ATTACK, TOUGH, MOVE, MOVE, MOVE];
    else if (nrg >= 390 && nrg < 530)
        return [ATTACK, RANGED_ATTACK, TOUGH, MOVE, MOVE, MOVE];
    else if (nrg >= 530 && nrg < 650)
        return [ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE];
    else if (nrg >= 650)
        return [ATTACK, RANGED_ATTACK, RANGED_ATTACK, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE];
}