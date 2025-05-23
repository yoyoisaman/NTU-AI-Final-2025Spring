async function mineCopperOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if we have a stone pickaxe
  let stonePickaxe = bot.inventory.findInventoryItem(mcData.itemsByName.stone_pickaxe.id);

  // If not, craft a stone pickaxe
  if (!stonePickaxe) {
    bot.chat("No stone pickaxe found, crafting one.");

    // Check if we have enough cobblestone and sticks
    const cobblestoneCount = bot.inventory.count(mcData.itemsByName.cobblestone.id);
    const stickCount = bot.inventory.count(mcData.itemsByName.stick.id);
    if (cobblestoneCount < 3) {
      bot.chat("Not enough cobblestone, mining more.");
      await mineBlock(bot, "stone", 3 - cobblestoneCount);
    }
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

    // Craft the stone pickaxe
    await craftItem(bot, "stone_pickaxe", 1);
    stonePickaxe = bot.inventory.findInventoryItem(mcData.itemsByName.stone_pickaxe.id);
  }

  // Equip the stone pickaxe
  await bot.equip(stonePickaxe, "hand");
  bot.chat("Equipped stone pickaxe.");

  // Find the copper ore block
  let copperOre = bot.findBlock({
    matching: mcData.blocksByName.copper_ore.id,
    maxDistance: 32
  });

  // If not found, explore to find one
  if (!copperOre) {
    bot.chat("No copper ore found nearby, exploring to find one.");
    copperOre = await exploreUntil(bot, new Vec3(Math.random(), 0, Math.random()), 60, () => {
      return bot.findBlock({
        matching: mcData.blocksByName.copper_ore.id,
        maxDistance: 32
      });
    });
  }

  // Mine the copper ore if found
  if (copperOre) {
    bot.chat("Found copper ore, mining it now.");
    await mineBlock(bot, "copper_ore", 1);
    bot.chat("Mined 1 copper ore.");
  } else {
    bot.chat("Could not find any copper ore nearby.");
  }
}