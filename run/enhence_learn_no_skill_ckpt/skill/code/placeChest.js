async function placeChest(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if the bot has a chest in the inventory
  const chestItem = bot.inventory.findInventoryItem(mcData.itemsByName['chest'].id);
  if (!chestItem) {
    bot.chat("No chest available in inventory to place.");
    return;
  }

  // Find a suitable position to place the chest
  const botPosition = bot.entity.position;
  const directions = [new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1)];
  let placePosition = null;
  for (const direction of directions) {
    const position = botPosition.plus(direction);
    const block = bot.blockAt(position);
    if (block && block.name === 'air') {
      placePosition = position;
      break;
    }
  }
  if (placePosition) {
    bot.chat(`Placing chest at ${placePosition}.`);
    await placeItem(bot, 'chest', placePosition);
    bot.chat("Chest placed successfully.");
  } else {
    bot.chat("No suitable location found to place the chest.");
  }
}