async function mineIronOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Equip the iron pickaxe
  const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName['iron_pickaxe'].id);
  if (ironPickaxe) {
    await bot.equip(ironPickaxe, 'hand');
    bot.chat("Equipped an iron pickaxe.");
  } else {
    bot.chat("No iron pickaxe available to mine iron.");
    return;
  }

  // Function to find iron ore
  function findIronOre() {
    return bot.findBlock({
      matching: mcData.blocksByName['iron_ore'].id,
      maxDistance: 32
    });
  }

  // Check current inventory for raw iron
  const currentRawIron = bot.inventory.count(mcData.itemsByName['raw_iron'].id);
  const ironNeeded = 15 - currentRawIron;
  let ironMined = 0;

  // Mine iron ore until we have enough
  while (ironMined < ironNeeded) {
    const ironOreBlock = findIronOre();
    if (ironOreBlock) {
      bot.chat(`Found iron ore at ${ironOreBlock.position}. Mining it now.`);
      await mineBlock(bot, 'iron_ore', 1);
      ironMined++;
      bot.chat(`Mined ${ironMined + currentRawIron} iron ore so far.`);
    } else {
      bot.chat("Could not find any more iron ore nearby.");
      break;
    }
  }
  if (ironMined + currentRawIron >= 15) {
    bot.chat("Successfully mined 15 iron ore.");
  } else {
    bot.chat(`Only mined ${ironMined + currentRawIron} iron ore. Need to find more iron ore.`);
  }
}