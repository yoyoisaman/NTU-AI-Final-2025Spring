async function craftStonePickaxe(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if we have enough materials
  const cobblestoneCount = bot.inventory.count(mcData.itemsByName['cobblestone'].id);
  const stickCount = bot.inventory.count(mcData.itemsByName['stick'].id);
  const jungleLogCount = bot.inventory.count(mcData.itemsByName['jungle_log'].id);
  if (cobblestoneCount < 3) {
    bot.chat("Not enough cobblestones to craft a stone pickaxe.");
    return;
  }

  // Craft sticks if needed
  if (stickCount < 2) {
    if (jungleLogCount > 0) {
      const planksToCraft = Math.ceil((2 - stickCount) / 4);
      await craftItem(bot, 'jungle_planks', planksToCraft);
      await craftItem(bot, 'stick', 1);
      bot.chat("Crafted sticks from jungle logs.");
    } else {
      bot.chat("Not enough jungle logs to craft sticks.");
      return;
    }
  }

  // Check if we have a crafting table
  const craftingTableItem = bot.inventory.findInventoryItem(mcData.itemsByName['crafting_table'].id);
  if (!craftingTableItem) {
    if (jungleLogCount >= 4) {
      await craftItem(bot, 'crafting_table', 1);
      bot.chat("Crafted a crafting table.");
    } else {
      bot.chat("Not enough materials to craft a crafting table.");
      return;
    }
  }

  // Place the crafting table
  const position = bot.entity.position.offset(1, 0, 0);
  await placeItem(bot, 'crafting_table', position);
  bot.chat("Placed a crafting table.");

  // Craft the stone pickaxe
  await craftItem(bot, 'stone_pickaxe', 1);
  bot.chat("Crafted a stone pickaxe.");
}