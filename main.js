var settings = require('_Settings');

var factory = require('creepFactory');
var roles = require('creepRoles');

var harvester = require('harvestStuff');
var builder = require('buildStuff');
var guardStuff = require('guardStuff');


module.exports.loop = function () {
    for(var r in Game.rooms) {
        var _room = Game.rooms[r];
        var _creeps = _room.find(FIND_CREEPS);
        var _spawns = _room.find(FIND_MY_SPAWNS);
        var _sources = _room.find(FIND_SOURCES);
        var _constSites = _room.find(FIND_CONSTRUCTION_SITES);
        var _extensions = [];
        var _towers = [];
        var _storages = [];
        
        var structs = _room.find(FIND_STRUCTURES);
        for(var i in structs) {
            if (structs[i].structureType == STRUCTURE_EXTENSION)
                _extensions.push(structs[i]);
            if (structs[i].structureType == STRUCTURE_TOWER)
                _towers.push(structs[i]);
            if (structs[i].structureType == STRUCTURE_STORAGE)
                _storages.push(structs[i]);
        }
        _room.memory.harvesterCount = 0;
        _room.memory.builderCount = 0;
        _room.memory.guardCount = 0;
        
        var targetSite = builder.GetPreferredTarget(_creeps[i], _constSites, _room.controller);
        for(var i in _creeps) {
            if(_creeps[i].memory.role) {
                switch(_creeps[i].memory.role.value) {
                    case roles.HARVESTER.value:
                        _room.memory.harvesterCount++;
                        harvester.Work(_creeps[i], _room, _spawns, _extensions, _towers, _storages);
                        break;
                    case roles.BUILDER.value:
                        _room.memory.builderCount++;
                        _creeps[i].memory.site = targetSite;
                        builder.Work(_creeps[i], _room, _spawns, _constSites, _storages, _extensions);
                        break;
                    case roles.GUARD.value:
                        _room.memory.guardCount++;
                        guardStuff(_creeps[i]);
                        break;
                }
            }
        }
        
        //remove old resources
        for(var i in Memory.creeps) {
            if(!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }
        
        factory.ProcessQueue(_room, _spawns, _sources, _constSites);
    }
}