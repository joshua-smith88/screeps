var settings = require('_Settings');
var roles = require('creepRoles');
var getParts = require('getParts');
var memFactory = require('getMemory');
var partsFactory = require('partsFactory');

module.exports = { 
    //we provide the creeps and spawns arrays so we don't have to waste CPU by looking them up again
    ProcessQueue: function (cur_room, room_spawns, room_sources) {
        //we don't have enough energy to create a unit even if we wanted. exit function and save CPU
        if (cur_room.energyAvailable < settings.MIN_UNIT_ENERGY)
            return;
        
        var hCount = cur_room.memory.hCount;
        var bCount = cur_room.memory.bCount;
        var gCount = cur_room.memory.gCount;

        
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
        
            
            if (hCount < settings.HARVESTER_ROOM_MAX) {
                creep.bodyParts = partsFactory.GetParts(roles.HARVESTER, nrg);
                creep.name = GetName(roles.HARVESTER);
                creep.memory = memFactory.GetMemoryObj(room_sources, roles.HARVESTER);
                //console.log(creep.bodyParts);
                //console.log(creep.memory.role.name);
            }
            if (hCount < settings.HARVESTER_ROOM_MAX && bCount < 5) {
                
            }
            
            //create the creep
            if (spawn.canCreateCreep(creep.bodyParts) == OK) {
                spawn.createCreep(creep.bodyParts, creep.name, creep.memory);
                //cur_room.creeps[creep.name].memory = creep.memory;
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