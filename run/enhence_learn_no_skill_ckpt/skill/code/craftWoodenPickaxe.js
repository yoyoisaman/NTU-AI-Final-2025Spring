async function craftWoodenPickaxe(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if we have enough sticks and planks
  const sticksNeeded = 2;
  const planksNeeded = 3;
  const stickCount = bot.inventory.count(mcData.itemsByName['stick'].id);
  const plankCount = bot.inventory.count(mcData.itemsByName['jungle_planks'].id);
  const jungleLogCount = bot.inventory.count(mcData.itemsByName['jungle_log'].id);

  // Convert jungle logs to planks if needed
  if (plankCount < planksNeeded) {
    if (jungleLogCount > 0) {
      const planksToCraft = Math.ceil((planksNeeded - plankCount) / 4);
      await craftItem(bot, 'jungle_planks', planksToCraft);
      bot.chat(`Converted jungle logs to wooden planks.`);
    } else {
      bot.chat("Not enough jungle logs to craft wooden planks.");
      return;
    }
  }

  // Craft sticks if needed
  if (stickCount < sticksNeeded) {
    const planksForSticks = Math.ceil((sticksNeeded - stickCount) / 4);
    await craftItem(bot, 'stick', planksForSticks);
    bot.chat("Crafted sticks.");
  }

  // Check if we have a crafting table
  const craftingTableItem = bot.inventory.findInventoryItem(mcData.itemsByName['crafting_table'].id);
  if (!craftingTableItem) {
    if (plankCount < 4) {
      bot.chat("Not enough planks to craft a crafting table.");
      return;
    }
    await craftItem(bot, 'crafting_table', 1);
    bot.chat("Crafted a crafting table.");
  }

  // Place the crafting table
  const position = bot.entity.position.offset(1, 0, 0);
  await placeItem(bot, 'crafting_table', position);
  bot.chat("Placed a crafting table.");

  // Craft the wooden pickaxe
  await craftItem(bot, 'wooden_pickaxe', 1);
  bot.chat("Crafted a wooden pickaxe.");
}