async function mineCoalOreBlocks(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if we have a pickaxe and equip it
  const pickaxe = bot.inventory.findInventoryItem(mcData.itemsByName['stone_pickaxe'].id) || bot.inventory.findInventoryItem(mcData.itemsByName['wooden_pickaxe'].id);
  if (pickaxe) {
    await bot.equip(pickaxe, 'hand');
    bot.chat("Equipped a pickaxe.");
  } else {
    bot.chat("No pickaxe available to mine coal.");
    return;
  }

  // Function to find coal ore
  function findCoalOre() {
    return bot.findBlock({
      matching: mcData.blocksByName['coal_ore'].id,
      maxDistance: 32
    });
  }

  // Explore until enough coal ore is found
  let coalMined = 0;
  while (coalMined < 10) {
    const coalOreBlock = await exploreUntil(bot, new Vec3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1), 60, findCoalOre);
    if (coalOreBlock) {
      bot.chat(`Found coal ore at ${coalOreBlock.position}. Mining it now.`);
      await mineBlock(bot, 'coal_ore', 1);
      coalMined++;
      bot.chat(`Mined ${coalMined} coal ore blocks so far.`);
    } else {
      bot.chat("Could not find any more coal ore nearby.");
      break;
    }
  }
  if (coalMined >= 10) {
    bot.chat("Successfully mined 10 coal ore blocks.");
  } else {
    bot.chat(`Only mined ${coalMined} coal ore blocks. Need to find more coal ore.`);
  }
}