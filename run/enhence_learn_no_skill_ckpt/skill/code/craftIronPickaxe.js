async function craftIronPickaxe(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if we have enough sticks
  const stickCount = bot.inventory.count(mcData.itemsByName['stick'].id);
  const sticksNeeded = 2;
  if (stickCount < sticksNeeded) {
    const junglePlanksCount = bot.inventory.count(mcData.itemsByName['jungle_planks'].id);
    const jungleLogsCount = bot.inventory.count(mcData.itemsByName['jungle_log'].id);

    // Convert jungle logs to planks if needed
    if (junglePlanksCount < 2 && jungleLogsCount > 0) {
      const planksToCraft = Math.ceil((sticksNeeded - stickCount) / 4);
      await craftItem(bot, 'jungle_planks', planksToCraft);
      bot.chat("Converted jungle logs to jungle planks.");
    }

    // Craft sticks
    await craftItem(bot, 'stick', 1);
    bot.chat("Crafted sticks.");
  }

  // Check if we have a crafting table
  const craftingTableItem = bot.inventory.findInventoryItem(mcData.itemsByName['crafting_table'].id);
  if (!craftingTableItem) {
    const junglePlanksCount = bot.inventory.count(mcData.itemsByName['jungle_planks'].id);
    if (junglePlanksCount >= 4) {
      await craftItem(bot, 'crafting_table', 1);
      bot.chat("Crafted a crafting table.");
    } else {
      bot.chat("Not enough planks to craft a crafting table.");
      return;
    }
  }

  // Place the crafting table
  const position = bot.entity.position.offset(1, 0, 0);
  await placeItem(bot, 'crafting_table', position);
  bot.chat("Placed a crafting table.");

  // Craft the iron pickaxe
  await craftItem(bot, 'iron_pickaxe', 1);
  bot.chat("Crafted an iron pickaxe.");
}