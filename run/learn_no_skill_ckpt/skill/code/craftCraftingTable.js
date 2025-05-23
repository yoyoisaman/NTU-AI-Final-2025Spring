async function craftCraftingTable(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if we already have a crafting table
  const craftingTableItem = bot.inventory.findInventoryItem(mcData.itemsByName.crafting_table.id);
  if (craftingTableItem) {
    bot.chat("Already have a crafting table.");
    return;
  }

  // Convert logs to planks
  const logTypes = ["jungle_log", "oak_log"];
  for (const logType of logTypes) {
    const logCount = bot.inventory.count(mcData.itemsByName[logType].id);
    if (logCount > 0) {
      const planksToCraft = Math.floor(logCount * 4 / 4); // 4 planks per log
      await craftItem(bot, logType.replace("_log", "_planks"), planksToCraft);
    }
  }

  // Craft the crafting table
  await craftItem(bot, "crafting_table", 1);
  bot.chat("Crafted a crafting table.");
}