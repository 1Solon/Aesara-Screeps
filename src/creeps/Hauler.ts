import { timeToRenew } from "./creepFunctions/timeToRenew";

export class Hauler {

  constructor(creep: Creep) {
    // Before logic loop, check if this creep needs to be renewed
    if (timeToRenew(creep)) {
      // 1: Refill Towers
      if (this.refillTowers(creep)) {
        // 2: Refill Refill Extensions
        if (this.refillExtension(creep)) {
          // 3: Refill Spawns
          if (this.refillSpawn(creep)) {
            // 4: Stockpile Energy
            if (this.refillStorage(creep)) {
              // 5: Refill Workers
              this.refillWorker(creep);
            }
          }
        }
      }
    }
  }

  // Refills the main room spawner
  refillSpawn(creep: Creep): boolean {
    const spawns = creep.room.find(FIND_MY_SPAWNS);

    // Display the state of the hauler
    creep.say("☀️", true);

    // Grab all not-full spawns
    const notFullSpawns = _.filter(spawns, function (i) {
      return i.store[RESOURCE_ENERGY] < 300;
    });

     // Get the tasks of all other haulers in the toom
     const creeps: Creep[] = creep.room.find(FIND_MY_CREEPS);
     const haulersDoingSameTask = creeps.filter(function (i) {
       return i.memory.role == "hauler" && i.memory.currentTaskPos == creep.memory.currentTaskPos;
     });

    // If there are any spawns that are not full
    if (notFullSpawns.length > 0 && haulersDoingSameTask.length == 1) {
      const closestSpawn = creep.pos.findClosestByRange(notFullSpawns);
      creep.memory.currentTaskPos = closestSpawn!.pos;

      // Make sure the creep has enough energy to achieve this task
      if (this.retrieveEnergy(creep, false)) {
        // Try to transfer energy to the spawn, if not in range
        if (closestSpawn) {
          if (creep.transfer(closestSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // Move to it
            creep.moveTo(closestSpawn, {
              visualizePathStyle: { stroke: "#ffaa00" },
              reusePath: 5
            });
          }
        }
      }
      return false;
    } else {
      return true;
    }
  }

  // Refills any empty extensions
  refillExtension(creep: Creep): boolean {
    // Display the state of the hauler
    creep.say("⭐", true);

    // Find empty extensions
    const extensions: StructureExtension[] = creep.room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_EXTENSION }
    });
    const notFullExtensions = _.filter(extensions, function (i) {
      return i.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
    });

    // Get the tasks of all other haulers in the toom
    const creeps: Creep[] = creep.room.find(FIND_MY_CREEPS);
    const haulersDoingSameTask = creeps.filter(function (i) {
      return i.memory.role == "hauler" && i.memory.currentTaskPos == creep.memory.currentTaskPos;
    });

    // If there are any empty extensions
    if (notFullExtensions.length > 0 && haulersDoingSameTask.length == 1) {
      // Make sure the creep has enough energy to achieve this task
      if (this.retrieveEnergy(creep, false)) {
        // Find the closest extension
        const closestEmptyExtension = creep.pos.findClosestByRange(notFullExtensions);
        creep.memory.currentTaskPos = closestEmptyExtension!.pos;

        if (closestEmptyExtension) {
          // Try to transfer energy to the extension. If it's not in range
          if (creep.transfer(closestEmptyExtension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // Move to it
            creep.moveTo(closestEmptyExtension, {
              visualizePathStyle: { stroke: "#ffaa00" },
              reusePath: 5
            });
          }
        }
      }
      return false;
    } else {
      return true;
    }
  }

  // Refills any empty towers
  refillTowers(creep: Creep): boolean {
    // Display the state of the hauler
    creep.say("🔫", true);

    // Find empty towers
    const towers: StructureTower[] = creep.room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_TOWER }
    });
    const notFullTowers = _.filter(towers, function (i) {
      return i.store[RESOURCE_ENERGY] < 600;
    });

    // If there are any towers that are not full
    if (notFullTowers.length > 0) {
      const closestTower = creep.pos.findClosestByRange(notFullTowers);
      creep.memory.currentTaskPos = closestTower!.pos;

      // Make sure the creep has enough energy to achieve this task
      if (this.retrieveEnergy(creep, false)) {
        // Try to transfer energy to the tower, if not in range
        if (closestTower) {
          if (creep.transfer(closestTower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // Move to it
            creep.moveTo(closestTower, {
              visualizePathStyle: { stroke: "#ffaa00" },
              reusePath: 5
            });
          }
        }
      }

      return false;
    } else {
      return true;
    }
  }

  // Refills Storages
  refillStorage(creep: Creep): boolean {
    // Display the state of the hauler
    creep.say("📦", true);

    // Find empty Storages
    const storages: StructureStorage[] = creep.room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_STORAGE }
    });
    const notFullStorages = _.filter(storages, function (i) {
      return i.store.getFreeCapacity() > 0;
    });

    // If there are any storages that are not full
    if (notFullStorages.length > 0) {
      const closestStorage = creep.pos.findClosestByRange(notFullStorages);

      // Make sure the creep has enough energy to achieve this task
      if (this.retrieveEnergy(creep, true)) {
        // Try to transfer energy to the storage, if not in range
        if (closestStorage) {
          if (creep.transfer(closestStorage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // Move to it
            creep.moveTo(closestStorage, {
              visualizePathStyle: { stroke: "#ffaa00" },
              reusePath: 5
            });
          }
        }
      }
      return false;
    } else {
      return true;
    }
  }

  // Handles worker refill
  refillWorker(creep: Creep): boolean {
    // Display the state of the hauler
    creep.say("👷", true);

    // Find empty workers
    const creeps: Creep[] = creep.room.find(FIND_MY_CREEPS);
    const workers = creeps.filter(function (i) {
      return i.memory.role == "worker";
    });
    const notFullWorkers = _.filter(workers, function (i) {
      // Ensure the worker is not full and not currently being served by another harvester
      return i.store[RESOURCE_ENERGY] < i.store.getCapacity() / 2 && !i.memory.beingServed;
    });

    // If there are any workers that are not full
    if (notFullWorkers.length > 0) {
      const closestWorker = creep.pos.findClosestByRange(notFullWorkers);

      // Make sure the creep has enough energy to achieve this task
      if (this.retrieveEnergy(creep, false)) {
        if (closestWorker) {
          // Mark this worker as being served
          closestWorker.memory.beingServed = true;

          // Try to transfer energy to the worker, if not in range
          if (creep.transfer(closestWorker, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // Move to it
            creep.moveTo(closestWorker, {
              visualizePathStyle: { stroke: "#ffaa00" },
              reusePath: 5
            });
          } else {
            // If energy was transferred successfully, mark the worker as no longer being served
            closestWorker.memory.beingServed = false;
          }
        }
      }
      return false;
    } else {
      return true;
    }
  }

  // Handles energy refill
  retrieveEnergy(creep: Creep, skipStorage: Boolean): boolean {
    const storage = creep.room.storage;

    // Find the closest container
    const allContainers: StructureContainer[] = creep.room.find(FIND_STRUCTURES, {
      filter: { structureType: STRUCTURE_CONTAINER }
    });

    // Find containers that have enough energy to fill the creep
    const containers = _.filter(allContainers, function (i) {
      return i.store[RESOURCE_ENERGY] > creep.store.getFreeCapacity();
    });

    // Find the closest container
    const closestContainer = creep.pos.findClosestByRange(containers);

    // Determine if the Hauler is empty
    if (creep.store.energy == 0) {
      // If a storage exists, and we're not skipping it
      if (storage != undefined && storage.store.energy > creep.store.getFreeCapacity() && !skipStorage) {
        if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          // Move to it
          creep.moveTo(storage, {
            visualizePathStyle: { stroke: "#ffaa00" },
            reusePath: 5
          });
        }
        return false;
      }

      // Pickup energy from a container
      else if (closestContainer != undefined && closestContainer.store.energy > creep.store.getFreeCapacity()) {
        if (creep.withdraw(closestContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          // Move to it
          creep.moveTo(closestContainer, {
            visualizePathStyle: { stroke: "#ffaa00" },
            reusePath: 5
          });
        }
        return false;
      }

      // Find energy on the ground
      else {
        const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
          filter: resource =>
            resource.resourceType == RESOURCE_ENERGY && resource.amount > creep.store.getFreeCapacity()
        });

        // Find the closest dropped energy
        const closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy);

        // Try to pickup the energy. If it's not in range
        if (closestDroppedEnergy) {
          if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
            // Move to it
            creep.moveTo(closestDroppedEnergy, {
              visualizePathStyle: { stroke: "#ffaa00" },
              reusePath: 5
            });
          }
        }
        return false;
      }
    }
    return true;
  }
}
