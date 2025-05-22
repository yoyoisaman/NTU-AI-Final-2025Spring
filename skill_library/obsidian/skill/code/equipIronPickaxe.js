async function equipIronPickaxe(bot) {
  // Find the iron pickaxe in the bot's inventory
  const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["iron_pickaxe"].id);
  if (ironPickaxe) {
    // Equip the iron pickaxe in the main hand
    await bot.equip(ironPickaxe, "hand");
    bot.chat("Iron pickaxe equipped.");
  } else {
    bot.chat("No iron pickaxe found in inventory.");
  }
}