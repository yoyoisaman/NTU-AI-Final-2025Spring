async function mineDeepslate(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Equip the diamond pickaxe for mining deepslate
  const diamondPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName['diamond_pickaxe'].id);
  if (diamondPickaxe) {
    await bot.equip(diamondPickaxe, 'hand');
    bot.chat("Equipped a diamond pickaxe for mining deepslate.");
  } else {
    bot.chat("No diamond pickaxe available.");
    return;
  }

  // Function to find deepslate
  function findDeepslate() {
    return bot.findBlock({
      matching: mcData.blocksByName['deepslate'].id,
      maxDistance: 32
    });
  }

  // Mine 20 deepslate blocks
  const deepslateNeeded = 20;
  const deepslateBlock = findDeepslate();
  if (deepslateBlock) {
    bot.chat(`Found deepslate at ${deepslateBlock.position}. Mining now.`);
    await mineBlock(bot, 'deepslate', deepslateNeeded);
    bot.chat("Successfully mined 20 deepslate blocks.");
  } else {
    bot.chat("Could not find any deepslate nearby.");
  }
}