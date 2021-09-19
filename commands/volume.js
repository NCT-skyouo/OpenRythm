module.exports.config = {
  name: "volume",
  aliases: ["vol"]
}
module.exports.run = async (bot, msg, args) => {
  // if (NaN != NaN) return msg.channel.send("For performance reasons, this command is currently for donators only. You must first donate here: https://rythmbot.co/donate?v")  
  if (!args[0] || isNaN(parseInt(args[0]))) return msg.channel.send(
    bot.embed.setTitle(bot.lang[bot.ulang].NoArgs)
      .setColor("#ff0000")
      .setDescription(bot.prefix + "volume [Number]")
  )
  
  if (!await msg.member.isDJ(np)) return msg.channel.send(bot.lc.user.NotDJ);
  bot.player.setVolume(msg.guild.id, parseInt(args[0]));
  msg.channel.send(`🔉 **Volume set to ${args[0]}!**`);
}