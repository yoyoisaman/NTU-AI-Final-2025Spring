async function mineObsidianToTen(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check the current inventory for obsidian
  const inventory = bot.inventory.items();
  let obsidianCount = 0;
  for (const item of inventory) {
    if (item.name === 'obsidian') {
      obsidianCount = item.count;
      break;
    }
  }

  // Calculate how many more obsidian blocks are needed
  const obsidianNeeded = 10 - obsidianCount;
  if (obsidianNeeded > 0) {
    // Equip the diamond pickaxe
    const diamondPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["diamond_pickaxe"].id);
    if (diamondPickaxe) {
      await bot.equip(diamondPickaxe, "hand");
      bot.chat("Diamond pickaxe equipped.");
    } else {
      bot.chat("No diamond pickaxe found.");
      return;
    }

    // Mine the required number of obsidian blocks
    await mineBlock(bot, 'obsidian', obsidianNeeded);
    bot.chat(`Mined ${obsidianNeeded} obsidian blocks.`);
  } else {
    bot.chat("Already have 10 or more obsidian blocks.");
  }
}