module.exports.config = {
  name: "eval",
  aliases: []
}
module.exports.run = async (bot, msg, args) => {
  if (msg.author.id != "599923291968241666") return msg.channel.send("For performance reasons, this command is currently for donators only. You must first donate here: https://rythmbot.co/donate?v") // todo: do nothing
  msg.channel.send("```" + eval(args.join(" ")) + "```")
}