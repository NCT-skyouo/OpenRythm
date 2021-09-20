const LocalTools = require("../libs/v5-core/src/LocalTools.js")

const Status = {
  rewind: "⏪",
  forward: "⏩"
}

module.exports.config = {
  name: "seek",
  aliases: []
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

  if (!msg.member.isDJ()) return msg.channel.send(bot.lc.user.NotDJ);

  if (!args[0] || !args[0].match(/\d+:\d+/)[0]) return msg.channel.send(bot.lc.user.NoArgs);

  const queue = bot.player.getQueue(msg.guild.id);

  var timeBefore = (queue.resource.playbackDuration + queue.additionalStreamTime)

  bot.player
    .seek(msg.guild.id, args[0])
    .then(async () => {
      var timeAfter = (queue.resource.playbackDuration + queue.additionalStreamTime)
      msg.channel.send(bot.lc.cmd.seek.success.replace("{duration}", LocalTools.ms2mmss(timeAfter)).replace("{emoji}", ((timeAfter - timeBefore) > 0) ? Status.forward : Status.rewind))
    })
    .catch((e) => {
      msg.channel.send(bot.lc.cmd.error.replace('{error}', e.stack))
    })
}