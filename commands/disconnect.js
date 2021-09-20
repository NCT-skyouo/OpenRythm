const { getVoiceConnection } = require("@discordjs/voice")

module.exports.config = {
  name: "disconnect",
  aliases: ["dc", "leave", "dis", "fuckoff"]
}
module.exports.run = async (bot, msg, args) => {
  if (!msg.member.voice.channel) return msg.channel.send(bot.lc.user.NoVC)
  if (!msg.guild.me.voice.channel) return msg.channel.send(bot.lang.default.bot.NotVC);
  if (
    msg.member.voice.channel &&
    msg.guild.me.voice.channel &&
    msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
  ) return msg.channel.send(bot.lc.user.NotSameVCWithBot);

  if (!msg.member.isDJ()) return msg.channel.send(bot.lc.user.NotDJ);
  
  try {
    // await msg.member.voice.channel.leave();
    if (bot.player.isPlaying(msg.guild.id)) await bot.player.stop(msg.guild.id).catch(e => { throw e });
    else getVoiceConnection(voiceChannel.guildId).destroy();

    msg.channel.send(bot.lc.cmd.disconnect.success);
  } catch (e) {
    msg.channel.send(bot.lc.cmd.error.replace('{error}', e.stack))
  }
}