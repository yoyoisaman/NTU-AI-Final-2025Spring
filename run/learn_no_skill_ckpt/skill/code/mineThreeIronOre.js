async function mineThreeIronOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if a stone pickaxe is available, if not, craft one
  let stonePickaxe = bot.inventory.findInventoryItem(mcData.itemsByName.stone_pickaxe.id);
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
  bot.chat("Stone pickaxe equipped.");

  // Find iron ore blocks
  let ironOreBlocks = bot.findBlocks({
    matching: mcData.blocksByName.iron_ore.id,
    maxDistance: 32,
    count: 3
  });

  // If not enough iron ore blocks are found, explore to find more
  if (ironOreBlocks.length < 3) {
    bot.chat("Not enough iron ore found nearby, exploring to find more.");
    await exploreUntil(bot, new Vec3(Math.random(), 0, Math.random()), 60, () => {
      ironOreBlocks = bot.findBlocks({
        matching: mcData.blocksByName.iron_ore.id,
        maxDistance: 32,
        count: 3
      });
      return ironOreBlocks.length >= 3 ? ironOreBlocks : null;
    });
  }

  // Mine the iron ore if found
  if (ironOreBlocks.length >= 3) {
    bot.chat("Found enough iron ore, mining it now.");
    await mineBlock(bot, "iron_ore", 3);
    bot.chat("Mined 3 iron ore.");
  } else {
    bot.chat("Could not find enough iron ore nearby.");
  }
}