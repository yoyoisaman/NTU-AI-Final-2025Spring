async function mineGoldOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Ensure the iron pickaxe is equipped
  const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName['iron_pickaxe'].id);
  if (ironPickaxe) {
    await bot.equip(ironPickaxe, 'hand');
    bot.chat("Equipped an iron pickaxe.");
  } else {
    bot.chat("No iron pickaxe available to mine gold.");
    return;
  }

  // Function to find gold ore
  function findGoldOre() {
    return bot.findBlock({
      matching: mcData.blocksByName['gold_ore'].id,
      maxDistance: 32
    });
  }

  // Mine 5 gold ore
  let goldMined = 0;
  while (goldMined < 5) {
    const goldOreBlock = findGoldOre();
    if (goldOreBlock) {
      bot.chat(`Found gold ore at ${goldOreBlock.position}. Mining it now.`);
      await mineBlock(bot, 'gold_ore', 1);
      goldMined++;
      bot.chat(`Mined ${goldMined} gold ore so far.`);
    } else {
      bot.chat("Could not find any more gold ore nearby.");
      break;
    }
  }
  if (goldMined >= 5) {
    bot.chat("Successfully mined 5 gold ore.");
  } else {
    bot.chat(`Only mined ${goldMined} gold ore. Need to find more gold ore.`);
  }
}