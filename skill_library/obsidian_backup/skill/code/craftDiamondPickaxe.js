async function craftDiamondPickaxe(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check for diamonds
  const diamond = bot.inventory.findInventoryItem(mcData.itemsByName["diamond"].id);
  if (!diamond || diamond.count < 3) {
    bot.chat("Not enough diamonds to craft a diamond pickaxe.");
    return;
  }

  // Check for sticks
  let sticks = bot.inventory.findInventoryItem(mcData.itemsByName["stick"].id);
  if (!sticks || sticks.count < 2) {
    // Check for any type of planks
    const planks = bot.inventory.findInventoryItem(mcData.itemsByName["birch_planks"].id) || bot.inventory.findInventoryItem(mcData.itemsByName["oak_planks"].id) || bot.inventory.findInventoryItem(mcData.itemsByName["spruce_planks"].id) || bot.inventory.findInventoryItem(mcData.itemsByName["jungle_planks"].id) || bot.inventory.findInventoryItem(mcData.itemsByName["acacia_planks"].id) || bot.inventory.findInventoryItem(mcData.itemsByName["dark_oak_planks"].id);
    if (!planks || planks.count < 2) {
      // Mine more birch logs if not enough planks
      await mineBlock(bot, "birch_log", 2);
      await craftItem(bot, "birch_planks", 2);
    }

    // Craft sticks
    await craftItem(bot, "stick", 2);
  }

  // Place a crafting table
  const craftingTable = bot.inventory.findInventoryItem(mcData.itemsByName["crafting_table"].id);
  if (!craftingTable) {
    bot.chat("No crafting table available.");
    return;
  }
  await placeItem(bot, "crafting_table", bot.entity.position.offset(1, 0, 0));

  // Craft the diamond pickaxe
  await craftItem(bot, "diamond_pickaxe", 1);

  // Report completion
  bot.chat("Diamond pickaxe crafted.");
}