module.exports.run = async (bot, msg, args) => {
  msg.channel.send("Shard ``[" + (bot.shard.ids) + " / " + bot.shard.count + "]``\nCluster ``[1 / 1]``") // todo: real cluster, using Project-Kristen/voice-server
}
module.exports.config = {
  name: "shard",
  aliases: []
}