async function mineWoodLogs(bot) {
  // Check if there are birch logs nearby
  let logs = bot.findBlocks({
    matching: block => block.name.includes("log"),
    maxDistance: 32,
    count: 10
  });

  // If not enough logs are found, explore to find more
  if (logs.length < 10) {
    await exploreUntil(bot, new Vec3(1, 0, 1), 60, () => {
      logs = bot.findBlocks({
        matching: block => block.name.includes("log"),
        maxDistance: 32,
        count: 10
      });
      return logs.length >= 10 ? logs : null;
    });
  }

  // Mine the logs
  await mineBlock(bot, "birch_log", 10);

  // Report the completion of the task
  bot.chat("10 wood logs mined.");
}