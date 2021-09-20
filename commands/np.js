// done

module.exports.run = async (bot, msg, args) => {
  if (!msg.member.voice.channel) return msg.channel.send(bot.lc.user.NoVC)
  if (!msg.guild.me.voice.channel) return msg.channel.send(bot.lang.default.bot.NotVC);
  if (
    msg.member.voice.channel &&
    msg.guild.me.voice.channel &&
    msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
  ) return msg.channel.send(bot.lc.user.NotSameVCWithBot);
  if (!bot.player.isPlaying(msg.guild.id)) return msg.channel.send(bot.lc.NoPlay)
  const queue = bot.player.getQueue(msg.guild.id)
  const currentStreamTime = queue.resource
      ? queue.resource.playbackDuration + queue.additionalStreamTime
      : 0  // song estimate time

  // old calculation => Date.now() - queue.startTime
  // new calculation => queue.resource.playbackDuration + queue.additionalStreamTime

  let song = await bot.player.nowPlaying(msg.guild.id);
  let dur = Math.round(currentStreamTime / 1000);
  let sngdur = song.durationMS / 1000;
  let go = Math.round((Math.round(dur) / sngdur) * 30)
  if (go < 1) go = 1
  let where = [..."▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬"]; // little trick to split unicode emoji correctly
  where.splice((go - 1), 0, "🔘")
  msg.channel.send({
    embeds: [bot.embed
      .setAuthor(bot.lc.cmd.nowPlaying.title, "https://media.discordapp.net/attachments/817960767441338378/886993057965289542/rythm.gif", "https://rythmbot.co")
      .setColor("BLUE")
      .setTitle(song.name)
      .setURL(song.url)
      .setDescription(bot.lc.cmd.nowPlaying.description.replace("{progress}", where.join("")).replace("{pass}", bot.time(dur)).replace("{duration}", bot.time(sngdur)).replace("{requester}", song.requestedBy))]
  });
}
module.exports.config = {
  name: "np",
  aliases: ["now-playing"]
}