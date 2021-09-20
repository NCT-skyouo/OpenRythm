module.exports.config = {
  name: "donate",
  aliases: ["patreon"]
}
module.exports.run = async (bot, msg, args) => {
  msg.channel.send({
    embeds: [new bot.dc.MessageEmbed()
      .setAuthor(bot.lc.cmd.donate.title, "https://media.discordapp.net/attachments/817960767441338378/886993057965289542/rythm.gif")
      .setColor("YELLOW")
      .setDescription(bot.lc.cmd.donate.description) // todo: replace this link with latest patreon link
    ]
  })
}