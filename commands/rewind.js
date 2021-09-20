const LocalTools = require("discord-player/src/LocalTools")

module.exports.config = {
  name: "rewind",
  aliases: ["rwd"]
}
module.exports.run = async (bot, msg, args) => {
  if (!msg.member.voice.channel) return msg.channel.send(bot.lc.user.NoVC)
  if (!msg.guild.me.voice.channel) return msg.channel.send(bot.lang.default.bot.NotVC);
  if (!bot.player.isPlaying(msg.guild.id)) return msg.channel.send(bot.lc.NoPlay);
  if (
    msg.member.voice.channel &&
    msg.guild.me.voice.channel &&
    msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
  ) return msg.channel.send(bot.lc.user.NotSameVCWithBot);

  var queue = bot.player.getQueue(msg.guild.id);

  if (!msg.member.isDJ()) return msg.channel.send(bot.lc.user.NotDJ);

  bot.player
    .rewind(msg.guild.id, isNaN(parseInt(args[0])) ? 0 : parseInt(args[0]))
    .then(async () => {
      var time = (queue.resource.playbackDuration + queue.additionalStreamTime)
      msg.channel.send(bot.lc.cmd.rewind.success.replace("{time}", LocalTools.ms2mmss(time)))
    })
    .catch((e) => {
      msg.channel.send(bot.lc.cmd.error.replace('{error}', e.stack))
    })
}