async function smeltRawGold(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if a furnace is available in the inventory
  let furnace = bot.inventory.findInventoryItem(mcData.itemsByName['furnace'].id);
  if (!furnace) {
    bot.chat("No furnace available to smelt raw gold.");
    return;
  }

  // Place the furnace near the bot
  const position = bot.entity.position.offset(1, 0, 0);
  await placeItem(bot, 'furnace', position);
  bot.chat("Placed a furnace.");

  // Smelt 5 raw gold using coal as fuel
  await smeltItem(bot, 'raw_gold', 'coal', 5);
  bot.chat("Smelted 5 raw gold into gold ingots.");
}