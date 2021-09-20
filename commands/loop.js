module.exports.run = async (bot, msg, args) => {
  if (!msg.member.voice.channel) return msg.channel.send(bot.lc.user.NoCon)
  if (!msg.guild.me.voice.channel) return msg.channel.send(bot.lc.bot.NotVC);
  if (
    msg.member.voice.channel &&
    msg.guild.me.voice.channel &&
    msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
  ) return msg.channel.send(bot.lc.user.NotSameVCWithBot);

  const queue = bot.player.getQueue(msg.guild.id);

  bot.player.setRepeatMode(msg.guild.id, !queue.repeatMode);
  msg.channel.send(!queue.repeatMode ? bot.lc.cmd.loop.enb : bot.lc.cmd.loop.dis)
}

module.exports.config = {
  name: "loop",
  aliases: ['repeat']
}