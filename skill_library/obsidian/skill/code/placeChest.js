async function placeChest(bot) {
  // Check if there is a chest in the inventory
  const chest = bot.inventory.findInventoryItem(mcData.itemsByName["chest"].id);
  if (!chest) {
    bot.chat("No chest available in inventory.");
    return;
  }

  // Choose a position near the bot to place the chest
  const offsets = [new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1)];
  let chestPosition = null;
  for (const offset of offsets) {
    const position = bot.entity.position.offset(offset.x, offset.y, offset.z);
    const block = bot.blockAt(position);
    if (block && block.name === "air") {
      chestPosition = position;
      break;
    }
  }
  if (!chestPosition) {
    bot.chat("No suitable position found to place the chest.");
    return;
  }

  // Place the chest at the chosen position
  await placeItem(bot, "chest", chestPosition);
  bot.chat("Chest placed successfully.");
}