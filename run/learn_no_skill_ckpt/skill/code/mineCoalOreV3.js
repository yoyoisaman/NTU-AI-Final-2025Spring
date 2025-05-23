async function mineCoalOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if there is a coal ore block nearby
  let coalOre = bot.findBlock({
    matching: mcData.blocksByName.coal_ore.id,
    maxDistance: 32
  });

  // If a coal ore block is found, mine it
  if (coalOre) {
    bot.chat("Found a coal ore, mining it now.");
    await mineBlock(bot, "coal_ore", 1);
    bot.chat("Mined 1 coal ore.");
  } else {
    // If not found, explore to find one
    bot.chat("No coal ore found nearby, exploring to find one.");
    coalOre = await exploreUntil(bot, new Vec3(Math.random(), 0, Math.random()), 60, () => {
      return bot.findBlock({
        matching: mcData.blocksByName.coal_ore.id,
        maxDistance: 32
      });
    });

    // Mine the coal ore if found
    if (coalOre) {
      bot.chat("Found a coal ore after exploring, mining it now.");
      await mineBlock(bot, "coal_ore", 1);
      bot.chat("Mined 1 coal ore.");
    } else {
      bot.chat("Could not find any coal ore nearby.");
    }
  }
}