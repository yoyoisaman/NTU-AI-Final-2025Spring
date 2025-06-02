async function mineCobblestone(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check current inventory for cobblestone
  const currentCobblestone = bot.inventory.count(mcData.itemsByName['cobblestone'].id);
  const cobblestoneNeeded = 20 - currentCobblestone;
  if (cobblestoneNeeded <= 0) {
    bot.chat("Already have 20 or more cobblestone.");
    return;
  }
  bot.chat(`Need to collect ${cobblestoneNeeded} more cobblestone.`);

  // Check if the bot has a pickaxe and equip it
  const pickaxe = bot.inventory.findInventoryItem(mcData.itemsByName['wooden_pickaxe'].id);
  if (pickaxe) {
    await bot.equip(pickaxe, 'hand');
  } else {
    bot.chat("No pickaxe found, crafting a wooden pickaxe.");
    await craftWoodenPickaxe(bot);
  }

  // Function to find a stone block
  function findStone() {
    return bot.findBlock({
      matching: mcData.blocksByName['stone'].id,
      maxDistance: 32
    });
  }

  // Explore until a stone block is found
  const stoneBlock = await exploreUntil(bot, new Vec3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1), 60, findStone);
  if (stoneBlock) {
    bot.chat(`Found stone at ${stoneBlock.position}. Mining cobblestone now.`);
    await mineBlock(bot, 'stone', cobblestoneNeeded);
    bot.chat("Successfully mined the required cobblestone.");
  } else {
    bot.chat("Could not find any stone nearby.");
  }
}