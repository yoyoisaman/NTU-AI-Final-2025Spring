async function mineDeepslateLapisOre(bot) {
  // Step 1: Ensure the iron pickaxe is equipped
  const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["iron_pickaxe"].id);
  if (!ironPickaxe) {
    bot.chat("No iron pickaxe available to mine deepslate lapis ore.");
    return;
  }
  await bot.equip(ironPickaxe, "hand");

  // Step 2: Locate the deepslate lapis ore
  const deepslateLapisOre = bot.findBlock({
    matching: mcData.blocksByName["deepslate_lapis_ore"].id,
    maxDistance: 32
  });
  if (!deepslateLapisOre) {
    bot.chat("No deepslate lapis ore found nearby.");
    return;
  }

  // Step 3: Mine the deepslate lapis ore
  await mineBlock(bot, "deepslate_lapis_ore", 1);

  // Step 4: Notify the user
  bot.chat("Deepslate lapis ore mined.");
}