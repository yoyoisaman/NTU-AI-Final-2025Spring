async function mineCoalOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if we already have coal in the inventory
  let coalCount = bot.inventory.count(mcData.itemsByName.coal.id);
  if (coalCount >= 1) {
    bot.chat("Already have 1 or more coal.");
    return;
  }

  // Explore until we find a coal ore
  const coalOre = await exploreUntil(bot, new Vec3(0, -1, 0), 60, () => {
    return bot.findBlock({
      matching: mcData.blocksByName.coal_ore.id,
      maxDistance: 32
    });
  });
  if (coalOre) {
    bot.chat("Found a coal ore, mining it now.");
    await mineBlock(bot, "coal_ore", 1);
    bot.chat("Collected 1 coal.");
  } else {
    bot.chat("Could not find any coal ore nearby.");
  }
}