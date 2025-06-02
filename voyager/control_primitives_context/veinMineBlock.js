/**
 * Mine an entire connected vein of blocks at once, greatly improving mining efficiency.
 * Compared to single-block mineBlock, veinMineBlock automatically identifies and mines connected blocks of the same type.
 * 
 * @param {object} bot - Mineflayer bot instance
 * @param {string} blockName - Name of the block to mine, e.g. "coal_ore", "iron_ore", "diamond_ore", etc.
 * @param {number} maxBlocks - Maximum number of blocks to mine, defaults to 32
 * @returns {Promise} - Promise that resolves when mining is complete
 * 
 * Examples:
 * // Mine an entire iron ore vein
 * await veinMineBlock(bot, "iron_ore");
 * 
 * // Mine a diamond ore vein, up to 50 blocks
 * await veinMineBlock(bot, "diamond_ore", 50);
 */