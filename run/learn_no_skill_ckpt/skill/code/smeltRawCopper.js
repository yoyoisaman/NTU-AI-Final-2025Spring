async function smeltRawCopper(bot) {
  const mcData = require('minecraft-data')(bot.version);

  // Check if a furnace is already placed nearby
  let furnaceBlock = bot.findBlock({
    matching: mcData.blocksByName.furnace.id,
    maxDistance: 32
  });

  // If no furnace is found, place one from the inventory
  if (!furnaceBlock) {
    bot.chat("No furnace found nearby, placing one.");
    await placeItem(bot, "furnace", bot.entity.position.offset(1, 0, 0));
    furnaceBlock = bot.findBlock({
      matching: mcData.blocksByName.furnace.id,
      maxDistance: 32
    });
  }

  // Smelt 3 raw copper using coal as fuel
  bot.chat("Smelting 3 raw copper.");
  await smeltItem(bot, "raw_copper", "coal", 3);
  bot.chat("Smelted 3 raw copper into copper ingots.");
}