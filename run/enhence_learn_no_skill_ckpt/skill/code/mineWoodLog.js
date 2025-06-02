async function mineWoodLog(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Function to find a log block
  function findLog() {
    const logNames = ["oak_log", "birch_log", "spruce_log", "jungle_log", "acacia_log", "dark_oak_log", "mangrove_log"];
    return bot.findBlock({
      matching: block => logNames.includes(block.name),
      maxDistance: 32
    });
  }

  // Explore until a log is found
  const logBlock = await exploreUntil(bot, new Vec3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1), 60, findLog);
  if (logBlock) {
    bot.chat(`Found a log at ${logBlock.position}. Mining it now.`);
    await mineBlock(bot, logBlock.name, 1);
    bot.chat("Successfully mined 1 wood log.");
  } else {
    bot.chat("Could not find any logs nearby.");
  }
}