async function mineIronOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Equip the stone pickaxe
  const stonePickaxe = bot.inventory.findInventoryItem(mcData.itemsByName['stone_pickaxe'].id);
  if (stonePickaxe) {
    await bot.equip(stonePickaxe, 'hand');
    bot.chat("Equipped a stone pickaxe.");
  } else {
    bot.chat("No stone pickaxe available to mine iron.");
    return;
  }

  // Function to find iron ore
  function findIronOre() {
    return bot.findBlock({
      matching: mcData.blocksByName['iron_ore'].id,
      maxDistance: 32
    });
  }

  // Explore until enough iron ore is found
  let ironMined = 0;
  while (ironMined < 5) {
    const ironOreBlock = await exploreUntil(bot, new Vec3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1), 60, findIronOre);
    if (ironOreBlock) {
      bot.chat(`Found iron ore at ${ironOreBlock.position}. Mining it now.`);
      await mineBlock(bot, 'iron_ore', 1);
      ironMined++;
      bot.chat(`Mined ${ironMined} iron ore so far.`);
    } else {
      bot.chat("Could not find any more iron ore nearby.");
      break;
    }
  }
  if (ironMined >= 5) {
    bot.chat("Successfully mined 5 iron ore.");
  } else {
    bot.chat(`Only mined ${ironMined} iron ore. Need to find more iron ore.`);
  }
}