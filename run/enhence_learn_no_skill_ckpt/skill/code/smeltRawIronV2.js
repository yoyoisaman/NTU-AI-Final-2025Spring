async function smeltRawIron(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if a furnace is available in the inventory
  let furnace = bot.inventory.findInventoryItem(mcData.itemsByName['furnace'].id);
  if (!furnace) {
    bot.chat("No furnace available to smelt raw iron.");
    return;
  }

  // Place the furnace near the bot
  const position = bot.entity.position.offset(1, 0, 0);
  await placeItem(bot, 'furnace', position);
  bot.chat("Placed a furnace.");

  // Smelt 18 raw iron using coal as fuel
  await smeltItem(bot, 'raw_iron', 'coal', 18);
  bot.chat("Smelted 18 raw iron into iron ingots.");
}