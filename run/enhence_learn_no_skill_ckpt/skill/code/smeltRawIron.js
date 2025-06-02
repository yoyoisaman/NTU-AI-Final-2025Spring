async function smeltRawIron(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if a furnace is available in the inventory
  let furnace = bot.inventory.findInventoryItem(mcData.itemsByName['furnace'].id);
  if (!furnace) {
    // Place the crafting table if not already placed
    const craftingTable = bot.inventory.findInventoryItem(mcData.itemsByName['crafting_table'].id);
    if (craftingTable) {
      const craftingTablePosition = bot.entity.position.offset(1, 0, 0);
      await placeItem(bot, 'crafting_table', craftingTablePosition);
      bot.chat("Placed a crafting table.");
    } else {
      bot.chat("No crafting table available to craft a furnace.");
      return;
    }

    // Craft a furnace using cobblestones
    const cobblestoneCount = bot.inventory.count(mcData.itemsByName['cobblestone'].id);
    if (cobblestoneCount >= 8) {
      await craftItem(bot, 'furnace', 1);
      bot.chat("Crafted a furnace.");
    } else {
      bot.chat("Not enough cobblestones to craft a furnace.");
      return;
    }
  }

  // Place the furnace near the bot
  const position = bot.entity.position.offset(1, 0, 0);
  await placeItem(bot, 'furnace', position);
  bot.chat("Placed a furnace.");

  // Smelt 6 raw iron using coal as fuel
  await smeltItem(bot, 'raw_iron', 'coal', 6);
  bot.chat("Smelted 6 raw iron into iron ingots.");
}