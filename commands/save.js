const LocalTools = require("discord-player/src/LocalTools");
const { MessageEmbed } = require("discord.js");

module.exports.config = {
  name: "save",
  aliases: ["grab", "yoink"]
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
  
  try {
    var date = new Date();
    await msg.react("📬").catch(e => { throw e });
    await msg.author.send({ embeds: [
      new MessageEmbed()
      .setTitle(bot.lc.cmd.save.title)
      .setURL(queue.playing.url)
      .setColor("7CFC00")
      .setDescription(bot.lc.cmd.save.description.replace("{title}", queue.playing.name).replace("{requester}", queue.playing.requestedBy).replace("{duration}", bot.time(queue.playing.durationMS / 1000)).replace("{url}", queue.playing.url))
      .setThumbnail(queue.playing.thumbnail)
      .setFooter(bot.lc.cmd.save.footer.replace("{date}", `${date.toISOString().split("T")[0]}`).replace("{guild}", msg.guild.name))
    ] })
  } catch (e) {

  }
}