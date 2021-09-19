require("dotenv").config();

const { ShardingManager } = require('discord.js');
const shard = new ShardingManager('./server.js', {
  token: process.env.TOKEN,
  autoSpawn: true
});

shard.spawn(1);

shard.on('launch', shard => console.log(`[SHARD] Shard ${shard.id}/${shard.totalShards}`));
