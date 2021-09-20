module.exports.run = async (bot, msg, args) => {
  if (!msg.member.voice.channel) return msg.channel.send(bot.lc.user.NoVC)
  if (!msg.guild.me.voice.channel) return msg.channel.send(bot.lang.default.bot.NotVC);
  if (
    msg.member.voice.channel &&
    msg.guild.me.voice.channel &&
    msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
  ) return msg.channel.send(bot.lc.user.NotSameVCWithBot);
  if (!bot.player.isPlaying(msg.guild.id)) return msg.channel.send(bot.lc.NoPlay)
  let queue = await bot.player.getQueue(msg.guild.id);
  var tracks = [queue.playing].concat(queue.tracks);
  let aa = tracks.map((song, i) => {
    if (i == 0) {
      return bot.lc.cmd.queue.np.replace("{name}", song.name).replace("{url}", song.url).replace("{duration}", bot.time(song.durationMS / 1000)).replace("{requester}", song.requestedBy)
    } else if (i == 1) {
      return bot.lc.cmd.queue.following.replace("{name}", song.name).replace("{url}", song.url).replace("{duration}", "").replace("{requester}", song.requestedBy).replace("{index}", i)
    } else {
      return bot.lc.cmd.queue.songs.replace("{name}", song.name).replace("{url}", song.url).replace("{duration}", "").replace("{requester}", song.requestedBy).replace("{index}", i)
    }
  }).join('\n')
  var embed;
  /*if (tracks.length < 2) {
    embed = bot.embed
      .setTitle("Queue for " + msg.guild.name)
      .setColor("RANDOM")
      .setURL("https://rythmbot.co")
      .setDescription(aa)
  } else {
    var times = 0;
    tracks.forEach((s) => times += (s.durationMS / 1000))
    var amonut = tracks.length
    if (amonut != 2) {
      embed = bot.embed
        .setTitle("Queue for " + msg.guild.name)
        .setColor("RANDOM")
        .setURL("https://rythmbot.co")
        .setDescription(aa)
        .setFooter(`${(tracks.length - 1)} songs in queue | ${bot.time(times)} total length`)
    } else {
      embed = bot.embed
        .setTitle("Queue for " + msg.guild.name)
        .setColor("RANDOM")
        .setURL("https://rythmbot.co")
        .setDescription(aa)
        .setFooter(`1 song in queue | ${bot.time(times)} total length`)
    }
  }*/

  var times = 0;
  tracks.forEach((s) => times += (s.durationMS / 1000))
  var amonut = tracks.length

  if (amonut > 1) {
    embed = bot.embed
      .setTitle(bot.lc.cmd.queue.title.replace("{guild}", msg.guild.name))
      .setColor("RANDOM")
      .setURL("https://rythmbot.co")
      .setDescription(aa)
      .setFooter(bot.lc.cmd.queue.footer_more_than_one.replace("{total_length}", tracks.length - 1).replace("{total_duration}", bot.time(times)))
  } else {
    embed = bot.embed
      .setTitle(bot.lc.cmd.queue.title.replace("{guild}", msg.guild.name))
      .setColor("RANDOM")
      .setURL("https://rythmbot.co")
      .setDescription(aa)
      .setFooter(bot.lc.cmd.queue.footer_one.replace("{total_duration}", bot.time(times)))
  }
  msg.channel.send({ embeds: [embed] })
  bot.embed = new bot.dc.MessageEmbed();
}
module.exports.config = {
  name: "queue",
  aliases: ["q"]
};
