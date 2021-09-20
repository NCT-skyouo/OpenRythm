module.exports.config = {
  name: "help",
  aliases: []
}
module.exports.run = async (bot, msg, args) => {
  let embed = new bot.dc.MessageEmbed().setTitle(bot.lc.cmd.help.title).setURL("https://rythmbot.co").setDescription(bot.lc.cmd.help.description)
  return msg.channel.send({ embeds: [embed] });
}