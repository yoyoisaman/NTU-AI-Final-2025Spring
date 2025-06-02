async function mineLapisLazuliOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Ensure the stone pickaxe is equipped
  const stonePickaxe = bot.inventory.findInventoryItem(mcData.itemsByName['stone_pickaxe'].id);
  if (stonePickaxe) {
    await bot.equip(stonePickaxe, 'hand');
    bot.chat("Equipped a stone pickaxe.");
  } else {
    bot.chat("No stone pickaxe available to mine lapis lazuli.");
    return;
  }

  // Function to find lapis lazuli ore
  function findLapisOre() {
    return bot.findBlock({
      matching: mcData.blocksByName['lapis_ore'].id,
      maxDistance: 32
    });
  }

  // Mine 5 lapis lazuli ore
  let lapisMined = 0;
  while (lapisMined < 5) {
    const lapisOreBlock = findLapisOre();
    if (lapisOreBlock) {
      bot.chat(`Found lapis lazuli ore at ${lapisOreBlock.position}. Mining it now.`);
      await mineBlock(bot, 'lapis_ore', 1);
      lapisMined++;
      bot.chat(`Mined ${lapisMined} lapis lazuli ore so far.`);
    } else {
      bot.chat("Could not find any more lapis lazuli ore nearby.");
      break;
    }
  }
  if (lapisMined >= 5) {
    bot.chat("Successfully mined 5 lapis lazuli ore.");
  } else {
    bot.chat(`Only mined ${lapisMined} lapis lazuli ore. Need to find more lapis lazuli ore.`);
  }
}