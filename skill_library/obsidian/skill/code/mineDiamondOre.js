async function mineDiamondOre(bot) {
  // Equip the iron pickaxe
  const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["iron_pickaxe"].id);
  await bot.equip(ironPickaxe, "hand");

  // Find the diamond ore block
  const diamondOre = bot.findBlock({
    matching: mcData.blocksByName["diamond_ore"].id,
    maxDistance: 32
  });
  if (diamondOre) {
    // Mine the diamond ore
    await mineBlock(bot, "diamond_ore", 1);
    bot.chat("Diamond ore mined.");
  } else {
    bot.chat("No diamond ore found nearby.");
  }
}