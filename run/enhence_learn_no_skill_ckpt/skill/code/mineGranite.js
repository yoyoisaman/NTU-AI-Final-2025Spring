async function mineGranite(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if we have a pickaxe and equip it
  const pickaxe = bot.inventory.findInventoryItem(mcData.itemsByName['stone_pickaxe'].id) || bot.inventory.findInventoryItem(mcData.itemsByName['wooden_pickaxe'].id);
  if (pickaxe) {
    await bot.equip(pickaxe, 'hand');
    bot.chat("Equipped a pickaxe.");
  } else {
    bot.chat("No pickaxe available to mine granite.");
    return;
  }

  // Function to find granite
  function findGranite() {
    return bot.findBlock({
      matching: mcData.blocksByName['granite'].id,
      maxDistance: 32
    });
  }

  // Locate and mine 10 granite blocks
  let graniteMined = 0;
  while (graniteMined < 10) {
    const graniteBlock = findGranite();
    if (graniteBlock) {
      bot.chat(`Found granite at ${graniteBlock.position}. Mining it now.`);
      await mineBlock(bot, 'granite', 1);
      graniteMined++;
      bot.chat(`Mined ${graniteMined} granite so far.`);
    } else {
      bot.chat("Could not find any more granite nearby.");
      break;
    }
  }
  if (graniteMined >= 10) {
    bot.chat("Successfully mined 10 granite.");
  } else {
    bot.chat(`Only mined ${graniteMined} granite. Need to find more granite.`);
  }
}