async function craftWoodenSword(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if we already have a wooden sword
  const woodenSwordItem = bot.inventory.findInventoryItem(mcData.itemsByName.wooden_sword.id);
  if (woodenSwordItem) {
    bot.chat("Already have a wooden sword.");
    return;
  }

  // Place the crafting table near the bot
  const craftingTablePosition = bot.entity.position.offset(1, 0, 0);
  await placeItem(bot, "crafting_table", craftingTablePosition);

  // Craft the wooden sword
  await craftItem(bot, "wooden_sword", 1);
  bot.chat("Crafted a wooden sword.");
}