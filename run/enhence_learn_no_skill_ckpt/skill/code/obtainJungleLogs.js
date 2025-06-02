async function obtainJungleLogs(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check current inventory for jungle logs
  const currentLogs = bot.inventory.count(mcData.itemsByName['jungle_log'].id);
  const logsNeeded = 10 - currentLogs;
  if (logsNeeded <= 0) {
    bot.chat("Already have 10 or more jungle logs.");
    return;
  }
  bot.chat(`Need to collect ${logsNeeded} more jungle logs.`);

  // Function to find a jungle log block
  function findJungleLog() {
    return bot.findBlock({
      matching: mcData.blocksByName['jungle_log'].id,
      maxDistance: 32
    });
  }

  // Explore until enough jungle logs are found
  for (let i = 0; i < logsNeeded; i++) {
    const jungleLogBlock = await exploreUntil(bot, new Vec3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1), 60, findJungleLog);
    if (jungleLogBlock) {
      bot.chat(`Found a jungle log at ${jungleLogBlock.position}. Mining it now.`);
      await mineBlock(bot, 'jungle_log', 1);
    } else {
      bot.chat("Could not find any more jungle logs nearby.");
      break;
    }
  }
  bot.chat("Finished collecting jungle logs.");
}