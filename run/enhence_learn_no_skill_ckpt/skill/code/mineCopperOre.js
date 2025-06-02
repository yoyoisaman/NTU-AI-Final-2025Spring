async function mineCopperOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if we have a stone pickaxe and equip it
  const stonePickaxe = bot.inventory.findInventoryItem(mcData.itemsByName['stone_pickaxe'].id);
  if (stonePickaxe) {
    await bot.equip(stonePickaxe, 'hand');
    bot.chat("Equipped a stone pickaxe.");
  } else {
    bot.chat("No stone pickaxe available to mine copper.");
    return;
  }

  // Function to find copper ore
  function findCopperOre() {
    return bot.findBlock({
      matching: mcData.blocksByName['copper_ore'].id,
      maxDistance: 32
    });
  }

  // Explore until enough copper ore is found
  let copperMined = 0;
  while (copperMined < 2) {
    const copperOreBlock = findCopperOre();
    if (copperOreBlock) {
      bot.chat(`Found copper ore at ${copperOreBlock.position}. Mining it now.`);
      await mineBlock(bot, 'copper_ore', 1);
      copperMined++;
      bot.chat(`Mined ${copperMined} copper ore so far.`);
    } else {
      bot.chat("Could not find any more copper ore nearby.");
      break;
    }
  }
  if (copperMined >= 2) {
    bot.chat("Successfully mined 2 copper ore.");
  } else {
    bot.chat(`Only mined ${copperMined} copper ore. Need to find more copper ore.`);
  }
}