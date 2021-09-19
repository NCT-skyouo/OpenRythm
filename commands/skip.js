module.exports.run = async (bot, msg, args) => {
  let music = bot.player;
  if (!msg.member.voice.channel) return msg.channel.send(bot.lc.user.NoVC)
  if (!msg.guild.me.voice.channel) return msg.channel.send(bot.lang.default.bot.NotVC);
  if (
    msg.member.voice.channel &&
    msg.guild.me.voice.channel &&
    msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
  ) return msg.channel.send(bot.lc.user.NotSameVCWithBot);
  if (!bot.player.isPlaying(msg.guild.id)) return msg.channel.send(bot.lc.NoPlay)
  let np = await music.nowPlaying(msg.guild.id).requestedBy;
  let queue = music.getQueue(msg.guild.id)

  if (queue.voter.some(m => m.id === msg.author.id)) return msg.channel.send(bot.lc.cmd.skip.alvoted)

  let voter = await bot.player.vote(msg.guild.id, msg.author);
  var need = Math.ceil((msg.member.voice.channel.members.filter(m => !m.user.bot).size - 1) * 0.75);

  if (queue.voter.length < need && np != msg.author.username) {
    return msg.channel.send(bot.lc.cmd.skip.notEno.replace("{cur}", voter.length).replace("{need}", need))
  }

  await music.skip(msg.guild.id);
  msg.channel.send(bot.lc.cmd.skip.skiped)
}
module.exports.config = {
  name: "skip",
  aliases: ["next"]
}