async function mineThreeCoalOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if there is a coal ore block nearby
  let coalOreBlocks = bot.findBlocks({
    matching: mcData.blocksByName.coal_ore.id,
    maxDistance: 32,
    count: 3
  });

  // If not enough coal ore blocks are found, explore to find more
  if (coalOreBlocks.length < 3) {
    bot.chat("Not enough coal ore found nearby, exploring to find more.");
    await exploreUntil(bot, new Vec3(Math.random(), 0, Math.random()), 60, () => {
      coalOreBlocks = bot.findBlocks({
        matching: mcData.blocksByName.coal_ore.id,
        maxDistance: 32,
        count: 3
      });
      return coalOreBlocks.length >= 3 ? coalOreBlocks : null;
    });
  }

  // Mine the coal ore if found
  if (coalOreBlocks.length >= 3) {
    bot.chat("Found enough coal ore, mining it now.");
    await mineBlock(bot, "coal_ore", 3);
    bot.chat("Mined 3 coal ore.");
  } else {
    bot.chat("Could not find enough coal ore nearby.");
  }
}