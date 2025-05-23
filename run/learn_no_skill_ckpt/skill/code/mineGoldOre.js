async function mineGoldOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if we have an iron pickaxe
  let ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName.iron_pickaxe.id);

  // If not, craft an iron pickaxe
  if (!ironPickaxe) {
    bot.chat("No iron pickaxe found, crafting one.");

    // Check if we have enough sticks
    const stickCount = bot.inventory.count(mcData.itemsByName.stick.id);
    if (stickCount < 2) {
      bot.chat("Not enough sticks, crafting more.");
      await craftItem(bot, "stick", 1);
    }

    // Place a crafting table if needed
    const craftingTable = bot.findBlock({
      matching: mcData.blocksByName.crafting_table.id,
      maxDistance: 32
    });
    if (!craftingTable) {
      bot.chat("Placing a crafting table.");
      await placeItem(bot, "crafting_table", bot.entity.position.offset(1, 0, 0));
    }

    // Craft the iron pickaxe
    await craftItem(bot, "iron_pickaxe", 1);
    ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName.iron_pickaxe.id);
  }

  // Equip the iron pickaxe
  await bot.equip(ironPickaxe, "hand");
  bot.chat("Equipped iron pickaxe.");

  // Find the gold ore block
  let goldOre = bot.findBlock({
    matching: mcData.blocksByName.gold_ore.id,
    maxDistance: 32
  });

  // If not found, explore to find one
  if (!goldOre) {
    bot.chat("No gold ore found nearby, exploring to find one.");
    goldOre = await exploreUntil(bot, new Vec3(Math.random(), 0, Math.random()), 60, () => {
      return bot.findBlock({
        matching: mcData.blocksByName.gold_ore.id,
        maxDistance: 32
      });
    });
  }

  // Mine the gold ore if found
  if (goldOre) {
    bot.chat("Found gold ore, mining it now.");
    await mineBlock(bot, "gold_ore", 1);
    bot.chat("Mined 1 gold ore.");
  } else {
    bot.chat("Could not find any gold ore nearby.");
  }
}