var settings = require('_Settings');

var factory = require('creepFactory');
var roles = require('creepRoles');
var tasks = require('creepTasks');

var harvester = require('harvestStuff');
var builder = require('buildStuff');
var guard = require('guardStuff');
var scout = require('scoutStuff');

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
    var _sources = [];
    var _spawns = [];
    var _creeps = [];
    
    var _structs = [];
    var _extensions = [];
    var _towers = [];
    var _storages = [];
    var _hostiles = [];
    
    var _scoutCount = 0;
    var _harvesterCount = 0;
    
    for(var r in Game.rooms) {
        var room = Game.rooms[r];
        _sources = _sources.concat(room.find(FIND_SOURCES));
        _spawns = _spawns.concat(room.find(FIND_MY_SPAWNS));
        _creeps = _creeps.concat(room.find(FIND_MY_CREEPS));
        _structs = _structs.concat(room.find(FIND_MY_STRUCTURES));
        _hostiles = _hostiles.concat(room.find(FIND_HOSTILE_CREEPS));
    }
    var creeps = room.find(FIND_MY_CREEPS);
    for(i = 0; i < creeps.length; i++)
    {
        if (creeps[i].memory.role.value == roles.SCOUT.value)
            _scoutCount++;
        if (creeps[i].memory.role.value == roles.HARVESTER.value)
            _harvesterCount++;
    }
    
    for(var i in _structs) {
        if (_structs[i].structureType == STRUCTURE_EXTENSION)
            _extensions.push(_structs[i]);
        if (_structs[i].structureType == STRUCTURE_TOWER)
            _towers.push(_structs[i]);
        if (_structs[i].structureType == STRUCTURE_STORAGE)
            _storages.push(_structs[i]);
    }
    
    Memory.scoutCount = _scoutCount;
    Memory.harvesterCount = _harvesterCount;
    
    
    for(var r in Game.rooms) {
        var _room = Game.rooms[r];
        var _constSites = _room.find(FIND_MY_CONSTRUCTION_SITES);
        var _hostiles = _room.find(FIND_HOSTILE_CREEPS);

        // if (Game.time % 10 == 0)
        //     buildRoads(_room, _spawns, _sources, _extensions, _storages);
        //clearSites(_constSites);
        
        //do we need to update the count for everything? (creep died, suicide, etc)
        var updateCounts = false;
        if (_creeps.length != _room.memory.harvesterCount + _room.memory.builderCount + _room.memory.guardCount + Memory.scoutCount) {
            _room.memory.harvesterCount = 0;
            _room.memory.builderCount = 0;
            _room.memory.guardCount = 0;
            Memory.scoutCount = 0;
            updateCounts = true;
        }
        
        //loop through the creeps and set them to work.
        for(var i in _creeps) {
            switch(_creeps[i].memory.role.value) {
                case roles.HARVESTER.value:
                    if (updateCounts == true)
                        _room.memory.harvesterCount++;
                    harvester.Work(_creeps[i], _room, _spawns, _extensions, _towers, _storages);
                    break;
                case roles.BUILDER.value:
                    if (updateCounts == true)
                        _room.memory.builderCount++;
                    if (_hostiles.length <= 0) { //freeze the builders if under attack - we need energy to build guards
                        _creeps[i].memory.site = builder.GetPreferredTarget(_creeps[i], _constSites, _room.controller);
                        builder.Work(_creeps[i], _room, _spawns, _constSites, _storages, _extensions, _towers);
                    }
                    break;
                case roles.GUARD.value:
                    if (updateCounts == true)
                        _room.memory.guardCount++;
                    guard.Work(_creeps[i]);
                    break;
                case roles.SCOUT.value:
                    if (updateCounts == true)
                        _room.memory.scoutCount++;
                    scout.Work(_creeps[i]);
                    break;
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
        
        //run the creep factory
        factory.ProcessQueue(_creeps, _room, _spawns, _sources, _constSites);

        //set the towers to destroy any baddies
        if (_hostiles.length > 0 && _towers.length > 0)
        {
            for(i = 0; i < _towers.length; i++) {
                _towers[i].attack(_hostiles[0]);
            }
        } else {
            
            var structsToMaintain = _room.find(FIND_STRUCTURES, {
                filter: function(obj) {
                    return obj.structureType == STRUCTURE_ROAD ||
                           obj.structureType == STRUCTURE_WALL ||
                           obj.structureType == STRUCTURE_RAMPART;
                }
            });
            towersRepairStructures(_towers, structsToMaintain);
        }
    }
}

function towersRepairStructures(towers, structures) {
    for (c = 0; c < towers.length; c++) {
        var structToUpdate;
        
        for(var i = 0; i < structures.length; i++) {
            var hits = structures[i].hits;
            var minHits = getMinHitsForStruct(structures[i]);
            var needsRepair = hits < minHits;
            
            if (needsRepair === true) {
                if (structToUpdate === undefined)
                    structToUpdate = structures[i];
                if (hits < structToUpdate.hits) {
                    structToUpdate = structures[i];
                }
            }
            
        }
        if (towers[c].energy > settings.MIN_TOWER_ENERGY_FOR_UPGRADE) {
            towers[c].repair(structToUpdate);
        }
    }
}

function getMinHitsForStruct(structure) {
    var minHits = 0;
    if (structure.structureType == "road")
        minHits = settings.MIN_ROAD_HITS;
    else if (structure.structureType == "constructedWall")
        minHits = settings.MIN_WALL_HITS;
    else if (structure.structureType == "rampart")
        minHits = settings.MIN_RAMPART_HITS;
    return minHits;
}

function clearSites(sites) {
    for(i = 0; i < sites.length; i++) {
        if (sites[i].structureType == STRUCTURE_ROAD)
            sites[i].remove();
    }
}

function buildRoads(room, spawns, sources, extensions, storages) {
    for(i = 0; i < spawns.length; i++) {
        //spawn to controller
        var controllerPath = spawns[i].pos.findPathTo(room.controller, { ignoreCreeps: true, heuristicWeight: 2500 });
        for(j = 0; j < controllerPath.length; j++) {
            var pos = new RoomPosition(controllerPath[j].x, controllerPath[j].y, room.name);
            var result = pos.createConstructionSite(STRUCTURE_ROAD);
            if (result == ERR_FULL)
                return; //too many construction sites. Exit.
        }
        
        //spawn to resources
        for(j = 0; j < sources.length; j++) {
            var resourcePath = spawns[i].pos.findPathTo(sources[j], { ignoreCreeps: true, heuristicWeight: 2500 });
            for(k = 0; k < resourcePath.length; k++) {
                var pos = new RoomPosition(resourcePath[k].x, resourcePath[k].y, room.name);
                var result = pos.createConstructionSite(STRUCTURE_ROAD);
                if (result == ERR_FULL)
                    return; //too many construction sites. Exit.
            }
                    
        }
    }
    
    for (i = 0; i < sources.length; i++) {
        var nearestExtension = sources[i].pos.findClosestByRange(extensions);
        var path = sources[i].pos.findPathTo(nearestExtension, { ignoreCreeps: true, heuristicWeight: 2500});
        for(j = 0; j < path.length; j++) {
            var pos = new RoomPosition(path[j].x, path[j].y, room.name);
            var result = pos.createConstructionSite(STRUCTURE_ROAD);
            if (result == ERR_FULL)
                return; //too many construction sites. exit.
        }
        var nearestStorage = sources[i].pos.findClosestByRange(storages);
        path = sources[i].pos.findPathTo(nearestStorage, { ignoreCreeps: true, heuristicWeight: 2500});
        for (j = 0; j < path.length; j++) {
            var pos = new RoomPosition(path[j].x, path[j].y, room.name);
            var result = pos.createConstructionSite(STRUCTURE_ROAD);
            if (result == ERR_FULL)
                return; //too many construction sites. exit.
        }
    }
    
    for(i = 0; i < extensions.length; i++)
    {
        var x = extensions[i].pos.x -1;
        var y = extensions[i].pos.y -1;
        var a = x + 2;
        var b = y + 2;
        while(x <= a)
        {
            y = extensions[i].pos.y -1;
            while(y <= b) {
                var pos = new RoomPosition(x, y, room.name);
                var result = pos.createConstructionSite(STRUCTURE_ROAD);
                if (result == ERR_FULL)
                    return;
                y++
            }
            x++;
        }
    }
}


