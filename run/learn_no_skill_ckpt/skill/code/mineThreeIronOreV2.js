async function mineThreeIronOre(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Equip the iron pickaxe
  const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName.iron_pickaxe.id);
  if (ironPickaxe) {
    await bot.equip(ironPickaxe, "hand");
    bot.chat("Equipped iron pickaxe.");
  } else {
    bot.chat("No iron pickaxe found in inventory.");
    return;
  }

  // Find iron ore blocks
  let ironOreBlocks = bot.findBlocks({
    matching: mcData.blocksByName.iron_ore.id,
    maxDistance: 32,
    count: 3
  });

  // If not enough iron ore blocks are found, explore to find more
  if (ironOreBlocks.length < 3) {
    bot.chat("Not enough iron ore found nearby, exploring to find more.");
    await exploreUntil(bot, new Vec3(Math.random(), 0, Math.random()), 60, () => {
      ironOreBlocks = bot.findBlocks({
        matching: mcData.blocksByName.iron_ore.id,
        maxDistance: 32,
        count: 3
      });
      return ironOreBlocks.length >= 3 ? ironOreBlocks : null;
    });
  }

  // Mine the iron ore if found
  if (ironOreBlocks.length >= 3) {
    bot.chat("Found enough iron ore, mining it now.");
    await mineBlock(bot, "iron_ore", 3);
    bot.chat("Mined 3 iron ore.");
  } else {
    bot.chat("Could not find enough iron ore nearby.");
  }
}