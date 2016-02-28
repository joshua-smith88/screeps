module.exports = function (creep, roomController, exts) {
    var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
    
    if (creep.carry.energy == 0) {
        var selectedExt;
        for (var i in exts) {
            if (selectedExt != null)
                selectedExt = exts[i];
            if (exts[i].energy > 0) {
               selectedExt = exts[i];
            }
        }
        if (selectedExt != null && selectedExt.energy === 0)
            selectedExt = null;
        
        if (selectedExt != null) {
            if (selectedExt.transferEnergy(creep) == ERR_NOT_IN_RANGE)
                creep.moveTo(selectedExt);
        } else {
            if (Game.spawns.MOTHERLAND.transferEnergy(creep) == ERR_NOT_IN_RANGE)
                creep.moveTo(Game.spawns.MOTHERLAND);
        }
    }
    
    if (targets.length > 0) {
        if (creep.build(targets[0]) == ERR_NOT_IN_RANGE)
            creep.moveTo(targets[0]);
    } else {
        if (creep.upgradeController(roomController) == ERR_NOT_IN_RANGE) {
            creep.moveTo(roomController)
        }
    }
}