async function mineDiamondOre(bot) {
  // Equip the iron pickaxe
  const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["iron_pickaxe"].id);
  await bot.equip(ironPickaxe, "hand");

  // Explore until a diamond ore is found
  const diamondOre = await exploreUntil(bot, new Vec3(0, -1, 0), 60, () => {
    return bot.findBlock({
      matching: mcData.blocksByName["diamond_ore"].id,
      maxDistance: 32
    });
  });
  if (diamondOre) {
    // Mine the diamond ore
    await mineBlock(bot, "diamond_ore", 1);
    bot.chat("Diamond ore mined.");
  } else {
    bot.chat("No diamond ore found within the exploration time.");
  }
}