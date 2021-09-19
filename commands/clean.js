module.exports.run = async (bot, msg, args) => {
  if (!msg.member.voice.channel) return msg.channel.send(bot.lc.user.NoVC)
  if (!msg.guild.me.voice.channel) return msg.channel.send(bot.lang.default.bot.NotVC);
  if (!bot.player.isPlaying(msg.guild.id)) return msg.channel.send(bot.lc.NoPlay);
  if (
    msg.member.voice.channel &&
    msg.guild.me.voice.channel &&
    msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
  ) return msg.channel.send(bot.lc.user.NotSameVCWithBot);

  if (!msg.member.isDJ()) return msg.channel.send(bot.lc.user.NotDJ);

  await bot.player.clearQueue(msg.guild.id) // todo: Is clear queue also stop playing?
    .then(() => msg.channel.send(":boom: ***Cleared...*** :stop_button:"))
    .catch((e) => msg.channel.send(":boom: ***Cleared...*** :stop_button:"))
}
module.exports.config = {
  name: "clean",
  aliases: ["clear"]
}