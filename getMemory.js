var roles = require('creepRoles');

module.exports = {
    GetMemoryObj: function(sources,creepRole) {
        switch(creepRole) {
            case roles.HARVESTER: 
                return { role: creepRole, source: GetHarvesterSource(sources) };
                break;
            case roles.BUILDER:
                return { role: creepRole };
                break;
            case roled.GUARD:
                return {role: creepRole };
                break;
        }
    }
}
function GetHarvesterSource(sources) {
    return Math.floor(Math.random() * sources.length) + 1;
}