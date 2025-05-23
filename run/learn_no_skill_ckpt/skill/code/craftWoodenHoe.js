async function craftWoodenHoe(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if we already have a wooden hoe
  const woodenHoeItem = bot.inventory.findInventoryItem(mcData.itemsByName.wooden_hoe.id);
  if (woodenHoeItem) {
    bot.chat("Already have a wooden hoe.");
    return;
  }

  // Place the crafting table near the bot
  const craftingTablePosition = bot.entity.position.offset(1, 0, 0);
  await placeItem(bot, "crafting_table", craftingTablePosition);

  // Craft the wooden hoe
  await craftItem(bot, "wooden_hoe", 1);
  bot.chat("Crafted a wooden hoe.");
}