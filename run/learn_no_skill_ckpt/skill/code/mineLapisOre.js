async function mineLapisOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if there is a lapis ore block nearby
  const lapisOre = bot.findBlock({
    matching: mcData.blocksByName.lapis_ore.id,
    maxDistance: 32
  });
  if (lapisOre) {
    bot.chat("Found a lapis ore, preparing to mine it.");

    // Equip the iron pickaxe
    const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName.iron_pickaxe.id);
    if (ironPickaxe) {
      await bot.equip(ironPickaxe, "hand");
      bot.chat("Equipped iron pickaxe.");

      // Mine the lapis ore
      await mineBlock(bot, "lapis_ore", 1);
      bot.chat("Mined 1 lapis ore.");
    } else {
      bot.chat("No suitable pickaxe found to mine lapis ore.");
    }
  } else {
    bot.chat("No lapis ore found nearby.");
  }
}