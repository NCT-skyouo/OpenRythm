module.exports.run = async (bot, msg, args) => {
  if (!msg.member.voice.channel) return msg.channel.send(bot.lang.default.NoChan);
  if (msg.guild.me.voice.channel) return msg.channel.send(bot.lang.default.AlChan);

  try {
    await bot.player._join(msg.member.voice.channel);
  } catch (e) {
    return msg.channel.send(bot.lang.default.NoPerm.replace("{channel}", msg.channel.name))
  }
  msg.channel.send(":thumbsup: **Joined** ``" + msg.member.voice.channel.name + "`` :page_facing_up: **And bound to **``" + msg.channel.name + "``")
}
module.exports.config = {
  name: "summon",
  aliases: ["join"]
}