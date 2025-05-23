async function obtainJungleLogs(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check current inventory for jungle logs
  let jungleLogCount = bot.inventory.count(mcData.itemsByName.jungle_log.id);

  // If we already have 3 or more jungle logs, no need to mine more
  if (jungleLogCount >= 3) {
    bot.chat("Already have 3 or more jungle logs.");
    return;
  }

  // Find a jungle log nearby
  let jungleLog = bot.findBlock({
    matching: mcData.blocksByName.jungle_log.id,
    maxDistance: 32
  });

  // If a jungle log is not found, explore to find one
  if (!jungleLog) {
    bot.chat("No jungle log found nearby, exploring to find one.");
    jungleLog = await exploreUntil(bot, new Vec3(Math.random(), 0, Math.random()), 60, () => {
      return bot.findBlock({
        matching: mcData.blocksByName.jungle_log.id,
        maxDistance: 32
      });
    });
  }

  // If a jungle log is found, mine it
  if (jungleLog) {
    bot.chat("Found a jungle log, mining it now.");
    // Calculate how many more logs we need
    const logsNeeded = 3 - jungleLogCount;
    await mineBlock(bot, "jungle_log", logsNeeded);
    bot.chat("Collected enough jungle logs.");
  } else {
    bot.chat("Could not find any jungle logs nearby.");
  }
}