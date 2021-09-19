module.exports.config = {
  name: "help",
  aliases: []
}
module.exports.run = async (bot, msg, args) => {
  let embed = new bot.dc.MessageEmbed().setTitle("Rythm Help").setURL("https://rythmbot.co").setDescription(":white_check_mark: [Click Here](https://rythmbot.co/features#list) for a list of commands\n\n:question: New to Rythm? Check out our [FAQ](https://rythmbot.co/faq)\n\n:page_facing_up: Still need help? [Click here](https://discord.gg/e69b6B5) to join our Discord server")
  return msg.channel.send({ embeds: [embed] });
}