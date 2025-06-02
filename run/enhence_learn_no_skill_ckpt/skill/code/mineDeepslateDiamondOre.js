async function mineDeepslateDiamondOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Ensure the diamond pickaxe is equipped
  const diamondPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName['diamond_pickaxe'].id);
  if (diamondPickaxe) {
    await bot.equip(diamondPickaxe, 'hand');
    bot.chat("Equipped a diamond pickaxe.");
  } else {
    bot.chat("No diamond pickaxe available to mine deepslate diamond ore.");
    return;
  }

  // Function to find deepslate diamond ore
  function findDeepslateDiamondOre() {
    return bot.findBlock({
      matching: mcData.blocksByName['deepslate_diamond_ore'].id,
      maxDistance: 32
    });
  }

  // Mine 5 deepslate diamond ore
  let diamondsMined = 0;
  while (diamondsMined < 5) {
    const diamondOreBlock = findDeepslateDiamondOre();
    if (diamondOreBlock) {
      bot.chat(`Found deepslate diamond ore at ${diamondOreBlock.position}. Mining it now.`);
      await mineBlock(bot, 'deepslate_diamond_ore', 1);
      diamondsMined++;
      bot.chat(`Mined ${diamondsMined} deepslate diamond ore so far.`);
    } else {
      bot.chat("Could not find any more deepslate diamond ore nearby.");
      break;
    }
  }
  if (diamondsMined >= 5) {
    bot.chat("Successfully mined 5 deepslate diamond ore.");
  } else {
    bot.chat(`Only mined ${diamondsMined} deepslate diamond ore. Need to find more deepslate diamond ore.`);
  }
}