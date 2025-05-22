async function mineDeepslateDiamondOre(bot) {
  // Step 1: Equip an iron pickaxe
  const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["iron_pickaxe"].id);
  if (!ironPickaxe) {
    bot.chat("No iron pickaxe available to mine deepslate diamond ore.");
    return;
  }
  await bot.equip(ironPickaxe, "hand");

  // Step 2: Locate the deepslate diamond ore
  const deepslateDiamondOre = bot.findBlock({
    matching: mcData.blocksByName["deepslate_diamond_ore"].id,
    maxDistance: 32
  });
  if (!deepslateDiamondOre) {
    bot.chat("No deepslate diamond ore found nearby.");
    return;
  }

  // Step 3: Mine the deepslate diamond ore
  await mineBlock(bot, "deepslate_diamond_ore", 1);

  // Step 4: Notify the user
  bot.chat("Deepslate diamond ore mined.");
}