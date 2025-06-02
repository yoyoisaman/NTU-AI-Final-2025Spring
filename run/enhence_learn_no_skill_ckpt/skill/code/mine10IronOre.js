async function mine10IronOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if the bot has a stone pickaxe, if not, craft one
  let stonePickaxe = bot.inventory.findInventoryItem(mcData.itemsByName['stone_pickaxe'].id);
  if (!stonePickaxe) {
    const cobblestoneCount = bot.inventory.count(mcData.itemsByName['cobblestone'].id);
    const stickCount = bot.inventory.count(mcData.itemsByName['stick'].id);
    if (cobblestoneCount >= 3 && stickCount >= 2) {
      const craftingTable = bot.inventory.findInventoryItem(mcData.itemsByName['crafting_table'].id);
      if (craftingTable) {
        const craftingTablePosition = bot.entity.position.offset(1, 0, 0);
        await placeItem(bot, 'crafting_table', craftingTablePosition);
        bot.chat("Placed a crafting table.");
        await craftItem(bot, 'stone_pickaxe', 1);
        bot.chat("Crafted a stone pickaxe.");
      } else {
        bot.chat("No crafting table available to craft a stone pickaxe.");
        return;
      }
    } else {
      bot.chat("Not enough materials to craft a stone pickaxe.");
      return;
    }
  }

  // Equip the stone pickaxe
  stonePickaxe = bot.inventory.findInventoryItem(mcData.itemsByName['stone_pickaxe'].id);
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
  const currentRawIron = bot.inventory.count(mcData.itemsByName['raw_iron'].id);
  const ironNeeded = 10 - currentRawIron;
  let ironMined = 0;
  while (ironMined < ironNeeded) {
    const ironOreBlock = await exploreUntil(bot, new Vec3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1), 60, findIronOre);
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
  if (ironMined + currentRawIron >= 10) {
    bot.chat("Successfully mined 10 iron ore.");
  } else {
    bot.chat(`Only mined ${ironMined + currentRawIron} iron ore. Need to find more iron ore.`);
  }
}