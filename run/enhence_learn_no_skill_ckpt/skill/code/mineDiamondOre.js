async function mineDiamondOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Ensure the iron pickaxe is equipped
  const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName['iron_pickaxe'].id);
  if (ironPickaxe) {
    await bot.equip(ironPickaxe, 'hand');
    bot.chat("Equipped an iron pickaxe.");
  } else {
    bot.chat("No iron pickaxe available to mine diamond.");
    return;
  }

  // Function to find diamond ore
  function findDiamondOre() {
    return bot.findBlock({
      matching: mcData.blocksByName['diamond_ore'].id,
      maxDistance: 32
    });
  }

  // Explore until enough diamond ore is found
  let diamondsMined = 0;
  while (diamondsMined < 5) {
    // Use a valid direction vector with values of -1, 0, or 1
    const direction = new Vec3(Math.floor(Math.random() * 3) - 1, -1, Math.floor(Math.random() * 3) - 1);
    const diamondOreBlock = await exploreUntil(bot, direction, 60, findDiamondOre);
    if (diamondOreBlock) {
      bot.chat(`Found diamond ore at ${diamondOreBlock.position}. Mining it now.`);
      await mineBlock(bot, 'diamond_ore', 1);
      diamondsMined++;
      bot.chat(`Mined ${diamondsMined} diamond ore so far.`);
    } else {
      bot.chat("Could not find any more diamond ore nearby.");
      break;
    }
  }
  if (diamondsMined >= 5) {
    bot.chat("Successfully mined 5 diamond ore.");
  } else {
    bot.chat(`Only mined ${diamondsMined} diamond ore. Need to find more diamond ore.`);
  }
}