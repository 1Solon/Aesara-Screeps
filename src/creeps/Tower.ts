export class Tower {
  constructor(roomName: Room) {
    let hostiles = roomName.find(FIND_HOSTILE_CREEPS);

    let towers: StructureTower[] = roomName.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
    for (let i = 0; i < towers.length; i++) {
      let tower = towers[i];

      if (hostiles.length > 0) {
        let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
          tower.attack(closestHostile);
        }
      } else if (tower.store[RESOURCE_ENERGY] > 500) {
        let closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
          filter: structure => structure.hits < (structure.hitsMax < 50000 ? structure.hitsMax : 50000)
        });

        if (closestDamagedStructure) {
          if (
            closestDamagedStructure.hits <
            (closestDamagedStructure.hitsMax < 50000 ? closestDamagedStructure.hitsMax : 50000)
          ) {
            if (tower.store[RESOURCE_ENERGY] > 500) {
              tower.repair(closestDamagedStructure);
            }
          }
        }
      }
    }
  }
}
