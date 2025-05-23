async function mineWoodLog(bot) {
  // Find a jungle log nearby
  const jungleLog = bot.findBlock({
    matching: block => block.name === "jungle_log",
    maxDistance: 32
  });

  // If a jungle log is found, mine it
  if (jungleLog) {
    bot.chat("Found a jungle log, mining it now.");
    await mineBlock(bot, "jungle_log", 1);
    bot.chat("Mined 1 jungle log.");
  } else {
    bot.chat("No jungle log found nearby.");
  }
}