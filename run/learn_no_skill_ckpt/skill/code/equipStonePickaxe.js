async function equipStonePickaxe(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Find the stone pickaxe in the inventory
  const stonePickaxe = bot.inventory.findInventoryItem(mcData.itemsByName.stone_pickaxe.id);
  if (stonePickaxe) {
    // Equip the stone pickaxe to the hand
    await bot.equip(stonePickaxe, "hand");
    bot.chat("Stone pickaxe equipped.");
  } else {
    bot.chat("No stone pickaxe found in inventory.");
  }
}