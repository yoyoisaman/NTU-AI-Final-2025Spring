async function craftSticks(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if we have enough planks to craft sticks
  const junglePlanksCount = bot.inventory.count(mcData.itemsByName.jungle_planks.id);
  if (junglePlanksCount >= 2) {
    bot.chat("Crafting 4 sticks from jungle planks.");
    // Craft 4 sticks using 2 jungle planks
    await craftItem(bot, "stick", 1);
    bot.chat("Crafted 4 sticks.");
  } else {
    bot.chat("Not enough planks to craft sticks.");
  }
}