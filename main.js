var settings = require('_Settings');

var factory = require('creepFactory');
var roles = require('creepRoles');

var harvester = require('harvestStuff');
var builder = require('buildStuff');
var guard = require('guardStuff');


module.exports.loop = function () {
    for(var r in Game.rooms) {
        var _room = Game.rooms[r];
        var _creeps = _room.find(FIND_MY_CREEPS);
        var _spawns = _room.find(FIND_MY_SPAWNS);
        var _sources = _room.find(FIND_SOURCES);
        var _constSites = _room.find(FIND_MY_CONSTRUCTION_SITES);
        var _extensions = [];
        var _towers = [];
        var _storages = [];
        var _hostiles = _room.find(FIND_HOSTILE_CREEPS);

        var structs = _room.find(FIND_MY_STRUCTURES);
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
        
        for(var i in _creeps) {
            if(_creeps[i].memory.role) {
                switch(_creeps[i].memory.role.value) {
                    case roles.HARVESTER.value:
                        harvester.Work(_creeps[i], _room, _spawns, _extensions, _towers, _storages);
                        break;
                    case roles.BUILDER.value:
                        if (_hostiles.length <= 0) {
                            _creeps[i].memory.site = builder.GetPreferredTarget(_creeps[i], _constSites, _room.controller);
                            builder.Work(_creeps[i], _room, _spawns, _constSites, _storages, _extensions);
                        }
                        break;
                    case roles.GUARD.value:
                        guard.Work(_creeps[i]);
                        break;
                }
            }
        }
        
        //remove old resources
        if (Memory.creeps.length != Game.creeps.length) {
            for(var i in Memory.creeps) {
                if(!Game.creeps[i]) {
                    var role = Memory.creeps[i].memory.role;
                    switch(role.value) {
                        case roles.HARVESTER.value:
                            _room.memory.harvesterCount--;
                            break;
                        case roles.BUILDER.value:
                            _room.memory.builderCount--;
                            break;
                        case roles.GUARD.value:
                            _room.memory.guardCount--;
                            break;
                    }
                    delete Memory.creeps[i];
                }
            }
        }
        
        factory.ProcessQueue(_room, _spawns, _sources, _constSites);
        if (_hostiles.length > 0 && _towers.length > 0)
        {
            for(i = 0; i < _towers.length; i++) {
                _towers[i].attack(_hostiles[0]);
            }
        }
    }
}