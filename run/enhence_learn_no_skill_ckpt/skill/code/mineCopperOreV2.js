async function mineCopperOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if we have a stone pickaxe or better and equip it
  let pickaxe = bot.inventory.findInventoryItem(mcData.itemsByName['iron_pickaxe'].id) || bot.inventory.findInventoryItem(mcData.itemsByName['stone_pickaxe'].id);
  if (!pickaxe) {
    bot.chat("No suitable pickaxe available to mine copper.");
    return;
  }
  await bot.equip(pickaxe, 'hand');
  bot.chat("Equipped a pickaxe.");

  // Function to find copper ore
  function findCopperOre() {
    return bot.findBlock({
      matching: mcData.blocksByName['copper_ore'].id,
      maxDistance: 32
    });
  }

  // Check current inventory for raw copper
  const currentRawCopper = bot.inventory.count(mcData.itemsByName['raw_copper'].id);
  const copperNeeded = 10 - currentRawCopper;
  let copperMined = 0;

  // Mine copper ore until we have enough
  while (copperMined < copperNeeded) {
    const copperOreBlock = await exploreUntil(bot, new Vec3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1), 60, findCopperOre);
    if (copperOreBlock) {
      bot.chat(`Found copper ore at ${copperOreBlock.position}. Mining it now.`);
      await mineBlock(bot, 'copper_ore', 1);
      copperMined++;
      bot.chat(`Mined ${copperMined + currentRawCopper} raw copper so far.`);
    } else {
      bot.chat("Could not find any more copper ore nearby.");
      break;
    }
  }
  if (copperMined + currentRawCopper >= 10) {
    bot.chat("Successfully mined 10 raw copper.");
  } else {
    bot.chat(`Only mined ${copperMined + currentRawCopper} raw copper. Need to find more copper ore.`);
  }
}