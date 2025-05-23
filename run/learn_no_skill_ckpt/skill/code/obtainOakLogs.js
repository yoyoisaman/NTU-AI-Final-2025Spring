async function obtainOakLogs(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check current inventory for oak logs
  let oakLogCount = bot.inventory.count(mcData.itemsByName.oak_log.id);

  // If we already have 3 or more oak logs, no need to mine more
  if (oakLogCount >= 3) {
    bot.chat("Already have 3 or more oak logs.");
    return;
  }

  // Explore until we find an oak log
  const oakLog = await exploreUntil(bot, new Vec3(1, 0, 1), 60, () => {
    return bot.findBlock({
      matching: mcData.blocksByName.oak_log.id,
      maxDistance: 32
    });
  });
  if (oakLog) {
    bot.chat("Found an oak log, mining it now.");
    // Calculate how many more logs we need
    const logsNeeded = 3 - oakLogCount;
    await mineBlock(bot, "oak_log", logsNeeded);
    bot.chat("Collected enough oak logs.");
  } else {
    bot.chat("Could not find any oak logs nearby.");
  }
}