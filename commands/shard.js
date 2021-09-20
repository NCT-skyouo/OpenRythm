module.exports.run = async (bot, msg, args) => {
  msg.channel.send(bot.lc.cmd.shard.details.replace("{shard_id}", msg.guild.shardId).replace("{shard_count}", bot.shard.count).replace("{cluster_id}", "1").replace("{cluster_count}", "1")) // todo: real cluster, using Project-Kristen/voice-server
}
module.exports.config = {
  name: "shard",
  aliases: []
}