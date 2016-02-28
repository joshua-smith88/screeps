var harvestStuff = require('harvestStuff');
var buildStuff = require('buildStuff');
var guardStuff =  require('guardStuff');
var getParts = require('getParts');
var settings = require('_Settings');
var factory = require('creepFactory');
var roles = require('creepRoles');

module.exports.loop = function () {
    for(var r in Game.rooms) {
        var _room = Game.rooms[r];
        var _creeps = _room.find(FIND_CREEPS);
        var _spawns = _room.find(FIND_MY_SPAWNS);
        var _sources = _room.find(FIND_SOURCES);
        var structs = _room.find(FIND_STRUCTURES);
        var _extensions = [];
        
        for(var i in structs) {
            if (structs[i].structureType == STRUCTURE_EXTENSION)
                _extensions.push(structs[i]);
        }
    
        _room.memory.hCount = 0;
        _room.memory.bCount = 0;
        _room.memory.gCount = 0;
        
        for(var i in _creeps) {
            var creep = _creeps[i];
            if(creep.memory.role) {
                switch(creep.memory.role.value) {
                    case roles.HARVESTER.value:
                        _room.memory.hCount++;
                        harvestStuff(creep, _room.controller, creep.memory.source, _extensions);
                        break;
                    case roles.BUILDER:
                        _room.memory.bCount++;
                        break;
                    case roles.GUARD:
                        _room.memory.gCount++;
                        break;
                }
            }
        }
        
        factory.ProcessQueue(_room, _spawns, _sources);
    }

    // var current_room = Game.spawns.MOTHERLAND.room;
    // var current_energy = current_room.energyAvailable;
    // var current_controller;
    // var structs = current_room.find(FIND_STRUCTURES);
    // var sources = current_room.find(FIND_SOURCES);
    // var targets = current_room.find(FIND_CONSTRUCTION_SITES);
    
    // for(var i in Memory.creeps) {
    //     if(!Game.creeps[i]) {
    //         delete Memory.creeps[i];
    //     }
    // }
    
    //if we run out of harvesters, but still have builders, make them harvesters!
    // if (harvesterCount == 0 && builderCount > 0) {
    //     for(var i in Game.creeps) {
    //         var creep = Game.creeps[i];
    //         creep.memory.role = 'harvester';
    //     }
    // }
    
    // for(var i in Game.creeps) {
    //     var creep = Game.creeps[i];
    //     switch(creep.memory.role){
    //         case 'harvester':
    //             harvestStuff(creep, current_controller, sources[creep.memory.defaultSourceIndex], roomExtensions);
    //             //harvesterCount++;
    //             break;
    //         case 'builder':
    //             buildStuff(creep, current_controller, roomExtensions);
    //             //builderCount++;
    //             break;
    //         case 'guard':
    //             guardStuff(creep);
    //             //guardCount++;
    //             break;
    //     }
    // }



}