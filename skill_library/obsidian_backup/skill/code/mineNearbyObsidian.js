async function mineNearbyObsidian(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Step 1: Equip the diamond pickaxe
  const diamondPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["diamond_pickaxe"].id);
  if (diamondPickaxe) {
    await bot.equip(diamondPickaxe, "hand");
    bot.chat("Diamond pickaxe equipped.");
  } else {
    bot.chat("No diamond pickaxe found.");
    return;
  }

  // Step 2: Locate the nearby obsidian block
  const obsidianBlock = bot.findBlock({
    matching: mcData.blocksByName["obsidian"].id,
    maxDistance: 32
  });
  if (obsidianBlock) {
    // Step 3: Mine the obsidian block
    await mineBlock(bot, "obsidian", 1);
    bot.chat("1 obsidian mined.");
  } else {
    bot.chat("No obsidian block found nearby.");
  }
}