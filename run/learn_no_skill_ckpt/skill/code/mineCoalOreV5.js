async function mineCoalOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if there is a coal ore block nearby
  const coalOre = bot.findBlock({
    matching: mcData.blocksByName.coal_ore.id,
    maxDistance: 32
  });

  // If a coal ore block is found, mine it
  if (coalOre) {
    bot.chat("Found a coal ore, mining it now.");
    await mineBlock(bot, "coal_ore", 1);
    bot.chat("Mined 1 coal ore.");
  } else {
    bot.chat("No coal ore found nearby.");
  }
}