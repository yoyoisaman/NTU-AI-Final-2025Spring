async function craftIronPickaxe(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if we already have an iron pickaxe
  const ironPickaxeItem = bot.inventory.findInventoryItem(mcData.itemsByName.iron_pickaxe.id);
  if (ironPickaxeItem) {
    bot.chat("Already have an iron pickaxe.");
    return;
  }

  // Place the crafting table near the bot
  const craftingTablePosition = bot.entity.position.offset(1, 0, 0);
  await placeItem(bot, "crafting_table", craftingTablePosition);

  // Craft the iron pickaxe
  await craftItem(bot, "iron_pickaxe", 1);
  bot.chat("Crafted an iron pickaxe.");
}