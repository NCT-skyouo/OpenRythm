module.exports.config = {
  name: "donate",
  aliases: ["patreon"]
}
module.exports.run = async (bot, msg, args) => {
  msg.channel.send({
    embeds: [new bot.dc.MessageEmbed()
      .setAuthor("Donation Info", "https://media.discordapp.net/attachments/817960767441338378/886993057965289542/rythm.gif")
      .setColor("YELLOW")
      .setDescription(`Rythm has become big - **really BIG!** It has become one of the most popular music bots, To ensure the best audio experience is delivered, we need to have a lot of server power. If you enjoy and use Rythm, please consider donating to show your appreciation and love.
P.S You get special rewards for donating!
[Patreon](https://rythmbot.co/donate?d)`) // todo: replace this link with latest patreon link
    ]
  })
}