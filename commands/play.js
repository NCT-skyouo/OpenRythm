const LocalTools = require("discord-player/src/LocalTools")
const Discord = require("discord.js")
module.exports.config = {
  name: "play",
  aliases: ['p']
}
module.exports.run = async (bot, msg, args) => {
  let toplay = args.join(" ");
  if (!args[0]) return msg.channel.send(
    bot.embed.setTitle(bot.lc.NoArgs)
      .setColor("#ff0000")
      .setDescription(bot.lc.play.failed.noargs.description.replace("{prefix}", bot.prefix))
  )
  if (!msg.member.voice.channel) return msg.channel.send(bot.lc.user.NotVC)
  if (
    msg.member.voice.channel &&
    msg.guild.me.voice.channel &&
    msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
  ) return msg.channel.send(bot.lc.user.NotSameVCWithBot);
  msg.channel.send(bot.lc.cmd.play.searching.replace("{query}", toplay)) // todo: Add icon for other websites like soundcloud, spotify, etc.
  let isPlaying = bot.player.isPlaying(msg.guild.id)

  if (isPlaying) {
    bot.player.addToQueue(msg.guild.id, toplay, msg.member.user.tag)
      .then(async (song) => {
        var songs = song.queue.tracks
        const currentStreamTime = song.queue.resource
          ? song.queue.resource.playbackDuration + song.queue.additionalStreamTime
          : 0

        const _clone = Array.from(songs)
        _clone.unshift(song.queue.playing)
        var act = LocalTools.ms2mmss(_clone.slice(1).map(s => s.durationMS).reduce((a, b) => a + b, 0) - currentStreamTime);
        let Embed = new bot.dc.MessageEmbed()
          .setAuthor(bot.lc.cmd.play.addqueue.title, await msg.author.displayAvatarURL(), 'https://rythmbot.co')
          .setColor("BLUE")
          .setTitle(song.name)
          .setThumbnail(song.thumbnail.url)
          .setURL(song.url)
          .addFields(
            { name: bot.lc.cmd.play.addqueue.fields["1"], value: song.author, inline: true },
            { name: bot.lc.cmd.play.addqueue.fields["2"], value: song.duration, inline: true },
            { name: bot.lc.cmd.play.addqueue.fields["3"], value: act, inline: true },
          )
          .addField(bot.lc.cmd.play.addqueue.fields["4"], String(song.queue.tracks.length), true)
        msg.channel.send({ embeds: [Embed] });
        bot.embed = new Discord.MessageEmbed()
      })
      .catch(e => {
        return msg.channel.send(bot.lc.cmd.play.failed.nomatched);
      });
  } else {
    try {
      await bot.player._join(msg.member.voice.channel);
    } catch (e) {
      return msg.channel.send(bot.lang.default.NoPerm.replace("{channel}", msg.channel.name))
    }
    bot.player.play(msg.member.voice.channel, toplay, msg.member.user.tag)
      .then((song) => {
        msg.channel.send(bot.lc.cmd.play.playing.replace("{name}", song.name))

        song.queue.on('end', async () => {
          if (bot.player.loop) {
            song = await bot.player.play(msg.member.voice.channel, toplay, msg.member.user.tag)
          }
        });

        song.queue.on('songChanged', (oldSong, newSong, skipped, repeatMode) => {
          if (repeatMode) {
            // need implement
          } else {

          }
        });
      })
      .catch(async e => {
        return msg.channel.send(bot.lc.cmd.play.failed.nomatched);
      });

  }
}