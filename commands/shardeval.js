module.exports = {
  config: {
    name: "shardeval",
    aliases: ["deveval", "seval"]
  },
  run: async (bot, msg, args) => {
    if (msg.author.id != "599923291968241666") return msg.channel.send("For performance reasons, this command is currently for donators only. You must first donate here: https://rythmbot.co/donate?v")
    try {
      const res = await bot.shard.broadcastEval(args.join(" ")).catch((e) => { throw new EvalError(e) });
      return msg.channel.send("```" + res + "```")
    } catch (e) {
      return msg.channel.send("```" + e + "```")
    }
  }
}