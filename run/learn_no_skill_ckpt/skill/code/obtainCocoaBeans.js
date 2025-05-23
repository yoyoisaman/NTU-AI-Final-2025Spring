async function obtainCocoaBeans(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check current inventory for cocoa beans
  let cocoaBeanCount = bot.inventory.count(mcData.itemsByName.cocoa_beans.id);

  // If we already have 3 or more cocoa beans, no need to collect more
  if (cocoaBeanCount >= 3) {
    bot.chat("Already have 3 or more cocoa beans.");
    return;
  }

  // Explore until we find a cocoa pod
  const cocoaPod = await exploreUntil(bot, new Vec3(Math.random(), 0, Math.random()), 60, () => {
    return bot.findBlock({
      matching: mcData.blocksByName.cocoa.id,
      maxDistance: 32
    });
  });
  if (cocoaPod) {
    bot.chat("Found a cocoa pod, harvesting it now.");
    // Harvest the cocoa pod
    await bot.dig(cocoaPod);
    bot.chat("Collected cocoa beans.");
  } else {
    bot.chat("Could not find any cocoa pods nearby.");
  }
}