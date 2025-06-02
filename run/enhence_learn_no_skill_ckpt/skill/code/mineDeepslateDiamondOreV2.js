async function mineDeepslateDiamondOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Equip the diamond pickaxe for mining deepslate diamond ore
  const diamondPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName['diamond_pickaxe'].id);
  if (diamondPickaxe) {
    await bot.equip(diamondPickaxe, 'hand');
    bot.chat("Equipped a diamond pickaxe for mining deepslate diamond ore.");
  } else {
    bot.chat("No diamond pickaxe available.");
    return;
  }

  // Function to find deepslate diamond ore
  function findDeepslateDiamondOre() {
    return bot.findBlock({
      matching: mcData.blocksByName['deepslate_diamond_ore'].id,
      maxDistance: 32
    });
  }

  // Mine 10 deepslate diamond ore
  let diamondsMined = 0;
  while (diamondsMined < 10) {
    const direction = new Vec3(Math.floor(Math.random() * 3) - 1, -1, Math.floor(Math.random() * 3) - 1);
    const diamondOreBlock = await exploreUntil(bot, direction, 60, findDeepslateDiamondOre);
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
  if (diamondsMined >= 10) {
    bot.chat("Successfully mined 10 deepslate diamond ore.");
  } else {
    bot.chat(`Only mined ${diamondsMined} deepslate diamond ore. Need to find more deepslate diamond ore.`);
  }
}