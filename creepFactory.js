var settings = require('_Settings');
var roles = require('creepRoles');

module.exports = { 
    ProcessQueue: function (my_creeps, cur_room, room_spawns, room_sources, construction_sites) {
        var minHarvesters = room_sources.length * settings.HARVESTERS_PER_SOURCE;
        //if there's not enough energy, do nothing. Save some CPU
        if (cur_room.energyAvailable < settings.MIN_UNIT_ENERGY)
            return;
            
        //if we have enough units in the room, do nothing and save some CPU
        if (Memory.harvesterCount >= minHarvesters &&
            cur_room.memory.builderCount >= settings.BUILDER_ROOM_MAX &&
            cur_room.memory.guardCount >= settings.GUARD_ROOM_MAX &&
            Memory.scoutCount >= settings.SCOUT_MAX)
            return;
        
        //figure out how much cumulative energy is held in the spawns
        var spawn_energy = 0;
        for(var s in room_spawns) {
            var spawn = room_spawns[s];
            spawn_energy += spawn.energy;
        }

        //lets determine which creep to build now
        for(var s in room_spawns) {

            //first, lets get the energy available to this spawn, specifically.
            var spawn = room_spawns[s];
            var nrg = (cur_room.energyAvailable - spawn_energy) + spawn.energy;

            var role;
        
            if (Memory.harvesterCount == 0 && nrg <= settings.MIN_UNIT_ENERGY) //this is our baby harvester.
                role = roles.HARVESTER;
            else if (Memory.harvesterCount < minHarvesters && nrg >= settings.MIN_HARVESTER_COST)
                role = roles.HARVESTER;

            if (Memory.harvesterCount >= minHarvesters) {
                if (cur_room.memory.builderCount < settings.BUILDER_ROOM_MAX && nrg >= settings.MIN_BUILDER_COST)
                    role = roles.BUILDER; 
                else if (cur_room.memory.guardCount < settings.GUARD_ROOM_PATROL && nrg >= settings.MIN_GUARD_COST)
                    role = roles.GUARD;
                else if (Memory.scoutCount < settings.SCOUT_MAX && nrg >= settings.MIN_SCOUT_COST)
                    role = roles.SCOUT;
            }
            
            //if we are under attack, prioritize building more guards, and build up to the room max
            if (cur_room.find(FIND_HOSTILE_CREEPS).length > 0 && cur_room.memory.guardCount < settings.GUARD_ROOM_MAX)
                role = roles.GUARD;

            if (role === undefined)
                return; //dont build anything, no role was a match

            //create the creep!
            var bodyParts = GetParts(role, nrg);
            var name = GetName(role);
            var mem = GetMemoryObj(my_creeps, room_sources, role);
            if (spawn.canCreateCreep(bodyParts) == OK) {
                spawn.createCreep(bodyParts, name, mem);
                switch(mem.role.value) {
                    case roles.HARVESTER.value:
                        Memory.harvesterCount++;
                        break;
                    case roles.BUILDER.value:
                        cur_room.memory.builderCount++;
                        break;
                    case roles.GUARD.value:
                        cur_room.memory.guardCount++;
                        break;
                    case roles.SCOUT.value:
                        Memory.scoutCount++;
                        break;
                }
            }
        }
    }
};
//determine which source to harvest from -- for harvester creeps
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
}
//lets get the memory object for the creep
function GetMemoryObj(creeps, sources, creepRole) {
    switch(creepRole) {
        case roles.HARVESTER: 
            return { role: creepRole, source: getHarvesterSource(creeps, sources) };
            break;
        case roles.BUILDER:
        case roles.GUARD:
        case roles.SCOUT:
            return { role: creepRole };
            break;
    }
}
//get body parts, depending on role
function GetParts(role, nrg) {
    switch(role) {
        case roles.HARVESTER:
            return getHarvesterParts(nrg);
        case roles.BUILDER:
            return getBuilderParts(nrg);
        case roles.GUARD:
            return getGuardParts(nrg);
        case roles.SCOUT:
            return [WORK, CLAIM, MOVE, MOVE];
    }
}
//generate a name for the creep
function GetName(role) {
    var result = '';
    var s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for(i = 0; i < 5; i++)
        result += s.charAt(Math.floor(Math.random() * s.length));
    
    return role.name + "_" + result;
}


//
//
// The following section is the mapping for body parts for the creeps.
// by mapping like this, i can support all stages of progress in the game from the very beginning, all the way to multi-room empires.
//
//

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
    else if (nrg >= 650 && nrg < 700)
        return [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE];
    else if (nrg >= 700 && nrg < 750)
        return [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE];
    else if (nrg >= 750)
    {
        var parts = [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE];
        nrg = nrg - 750;
        var part = CARRY;
        
        while (nrg > 0) {
            parts.push(part);
            if (part == CARRY)
                part = MOVE;
            else if (part == MOVE)
                part = CARRY;
            nrg -= 50
        }
        return parts;
    }
        
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
    {
        var parts = [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE];
        nrg = nrg - 750;
        var part = CARRY;
        
        while (nrg > 0) {
            parts.push(part);
            if (part == CARRY)
                part = MOVE;
            else if (part == MOVE)
                part = CARRY;
            nrg -= 50
        }
        return parts;
    }
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
    else if (nrg >= 990) {
        var parts = [RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
        return parts;
    }
}