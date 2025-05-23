async function placeChest(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if there is a chest in the inventory
  const chestItem = bot.inventory.findInventoryItem(mcData.itemsByName.chest.id);
  if (!chestItem) {
    bot.chat("No chest found in inventory.");
    return;
  }

  // Determine a position to place the chest
  const positionToPlace = bot.entity.position.offset(1, 0, 0);

  // Place the chest
  await placeItem(bot, "chest", positionToPlace);
  bot.chat("Placed a chest.");
}