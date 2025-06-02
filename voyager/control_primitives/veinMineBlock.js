async function veinMineBlock(bot, blockName, maxBlocks = 32) {
  const mcData = require('minecraft-data')(bot.version);
  const blockId = mcData.blocksByName[blockName].id;
  const startBlock = bot.findBlock({
    matching: blockId,
    maxDistance: 32
  });
  if (!startBlock) {
    bot.chat(`No ${blockName} found nearby.`);
    return;
  }
  // 使用 collectBlock 插件的 vein 查找
  const CollectBlock = require('mineflayer-collectblock').CollectBlock;
  const collector = new CollectBlock(bot);
  const veinBlocks = collector.findFromVein(startBlock, maxBlocks, 16, 1);
  if (!veinBlocks.length) {
    bot.chat(`No vein found for ${blockName}.`);
    return;
  }
  bot.chat(`Mining ${veinBlocks.length} ${blockName} blocks in the vein.`);
  for (const block of veinBlocks) {
    await bot.dig(block);
  }
  bot.chat(`Finished mining vein of ${blockName}.`);
}