var roles = require('creepRoles');

module.exports = {
    GetParts: function(role, nrg) {
        switch(role) {
            case roles.HARVESTER:
                return getHarvesterParts(nrg);
            case roles.BUILDER:
                return getBuilderParts(nrg);
            case roles.GUARD:
                return getGuardParts(nrg);
        }
    }
}

function getBuilderParts(nrg) {
    if (nrg >= 250 && nrg <= 300)
        return [WORK, CARRY, MOVE, MOVE];
    else if (nrg >= 350 && nrg <= 400)
        return [WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
    else if (nrg >= 450 && nrg < 500)
        return  [WORK, WORK, CARRY, MOVE, MOVE, MOVE];
    else if (nrg >= 500 && nrg < 650)
        return [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
    else if (nrg >= 650 && nrg < 750)
        return [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
    else if (nrg >= 750)
        return [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
}

function getHarvesterParts(nrg) {
    return getBuilderParts(nrg);
}

function getGuardParts(nrg) {
    if (nrg >= 190 && nrg < 250)
        return [ATTACK, TOUGH, MOVE, MOVE];
    else if (nrg >= 250 && nrg < 330)
        return [ATTACK, TOUGH, TOUGH, MOVE, MOVE, MOVE];
    else if (nrg >= 330 && nrg < 440)
        return [RANGED_ATTACK, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE];
    else if (nrg >= 440 && nrg < 500)
        return [RANGED_ATTACK, RANGED_ATTACK, TOUGH, MOVE, MOVE, MOVE];
    else if (nrg >= 500 && nrg < 520)
        return [RANGED_ATTACK, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    else if (nrg >= 520)
        return [RANGED_ATTACK, RANGED_ATTACK, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE];
}