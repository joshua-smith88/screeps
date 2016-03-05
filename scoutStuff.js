var settings = require('_Settings');
var tasks = require('creepTasks');
var roles = require('creepRoles');

module.exports = {
    Work: function (creep) {
        var curRoom = creep.room;
        var homeRoom = settings.HOME_ROOM;
        if (curRoom.name != homeRoom) {
            var sources = curRoom.find(FIND_SOURCES);
            var closestSource = creep.pos.findClosestByPath(sources);
            if (!creep.pos.isNearTo(closestSource))
                creep.moveTo(closestSource);
            //console.log(JSON.stringify(closestSource));
        } else {
            var exit = creep.room.findExitTo('W11N12');
            var closest = creep.pos.findClosestByRange(exit);
            //var exit = curRoom.pos.findClosestByRange(curRoom.findExitTo('W11N12'));
            creep.moveTo(closest);
        }
    }
}
