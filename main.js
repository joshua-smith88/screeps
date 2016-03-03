var settings = require('_Settings');

var factory = require('creepFactory');
var roles = require('creepRoles');

var harvester = require('harvestStuff');
var builder = require('buildStuff');
var guard = require('guardStuff');

var directions = [
        TOP,
        TOP_RIGHT,
        RIGHT,
        BOTTOM_RIGHT,
        BOTTOM,
        BOTTOM_LEFT,
        LEFT,
        TOP_LEFT
    ];
var center = { x: 26, y: 26 }

var pickRandomMove = function () {
    return directions[Math.floor(Math.random() * directions.length)];
}
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
        var _walls = [];

        var structs = _room.find(FIND_MY_STRUCTURES);
        for(var i in structs) {
            if (structs[i].structureType == STRUCTURE_EXTENSION)
                _extensions.push(structs[i]);
            if (structs[i].structureType == STRUCTURE_TOWER)
                _towers.push(structs[i]);
            if (structs[i].structureType == STRUCTURE_STORAGE)
                _storages.push(structs[i]);
            if (structs[i].structureType == "constructedWall")
                _walls.push(structs[i]);
        }

        //this little snippet will help creeps from binding up on each other while trying to go to the same location
        if (Game.time % 50 == 0) {
            for(i = 0; i < _creeps.length; i++) {
                var creep = _creeps[i];
                if (creep.memory.role.value == roles.HARVESTER.value)
                    creep.move(pickRandomMove());
            }
        }
        
        var updateCounts = false;
        
        if (_creeps.length != _room.memory.harvesterCount + _room.memory.builderCount + _room.memory.guardCount) {
            _room.memory.harvesterCount = 0;
            _room.memory.builderCount = 0;
            _room.memory.guardCount = 0;
            updateCounts = true;
        }
        
        for(var i in _creeps) {
            if(_creeps[i].memory.role) {
                switch(_creeps[i].memory.role.value) {
                    case roles.HARVESTER.value:
                        if (updateCounts == true)
                            _room.memory.harvesterCount++;
                        harvester.Work(_creeps[i], _room, _spawns, _extensions, _towers, _storages);
                        break;
                    case roles.BUILDER.value:
                        if (updateCounts == true)
                            _room.memory.builderCount++;
                        if (_hostiles.length <= 0) {
                            _creeps[i].memory.site = builder.GetPreferredTarget(_creeps[i], _constSites, _room.controller);
                            builder.Work(_creeps[i], _room, _spawns, _constSites, _storages, _extensions, _towers);
                        }
                        break;
                    case roles.GUARD.value:
                        if (updateCounts == true)
                            _room.memory.guardCount++;
                        guard.Work(_creeps[i]);
                        break;
                }
            }
        }
        
        //remove old resources
        var removedCount = 0;
        if (updateCounts) {
            for(var i in Memory.creeps) {
                if(!Game.creeps[i]) {
                    removedCount++;
                    delete Memory.creeps[i];
                }
            }
        }
        
        factory.ProcessQueue(_creeps, _room, _spawns, _sources, _constSites);
        if (_hostiles.length > 0 && _towers.length > 0)
        {
            for(i = 0; i < _towers.length; i++) {
                _towers[i].attack(_hostiles[0]);
            }
        }
    }
}