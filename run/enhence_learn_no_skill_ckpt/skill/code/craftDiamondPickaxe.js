async function craftDiamondPickaxe(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check for sticks in the inventory
  const stickCount = bot.inventory.count(mcData.itemsByName['stick'].id);
  const sticksNeeded = 2;
  if (stickCount < sticksNeeded) {
    const jungleLogCount = bot.inventory.count(mcData.itemsByName['jungle_log'].id);
    if (jungleLogCount > 0) {
      const planksToCraft = Math.ceil((sticksNeeded - stickCount) / 4);
      await craftItem(bot, 'jungle_planks', planksToCraft);
      await craftItem(bot, 'stick', 1);
      bot.chat("Crafted sticks from jungle logs.");
    } else {
      bot.chat("Not enough jungle logs to craft sticks.");
      return;
    }
  }

  // Check if a crafting table is placed
  const craftingTable = bot.findBlock({
    matching: mcData.blocksByName['crafting_table'].id,
    maxDistance: 32
  });
  if (!craftingTable) {
    const position = bot.entity.position.offset(1, 0, 0);
    await placeItem(bot, 'crafting_table', position);
    bot.chat("Placed a crafting table.");
  }

  // Craft the diamond pickaxe
  await craftItem(bot, 'diamond_pickaxe', 1);
  bot.chat("Crafted a diamond pickaxe.");
}