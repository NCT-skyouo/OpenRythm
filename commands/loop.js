module.exports.run = async (bot, msg, args) => {
  if (!msg.member.voice.channel) return msg.channel.send(bot.lc.user.NoCon)
  if (!msg.guild.me.voice.channel) return msg.channel.send(bot.lc.bot.NotVC);
  if (
    msg.member.voice.channel &&
    msg.guild.me.voice.channel &&
    msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
  ) return msg.channel.send(bot.lc.user.NotSameVCWithBot);

  if (bot.player.loop == false) { // imporve: use ! and combine them
    bot.player.setRepeatMode(msg.guild.id, true);
    let song = await bot.player.nowPlaying(msg.guild.id)
    msg.channel.send(bot.lc.cmd.loop.enb)
    bot.player.loop = true;
  } else {
    bot.player.setRepeatMode(msg.guild.id, false)
    let song = await bot.player.nowPlaying(msg.guild.id)
    msg.channel.send(bot.lc.cmd.loop.dis)
    bot.player.loop = false;
  }
}

module.exports.config = {
  name: "loop",
  aliases: ['repeat']
}