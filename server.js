const fs = require("fs");
const db = require("quick.db")
const Discord = require("discord.js");
const Intents = Discord.Intents;
const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
const express = require("express");
const app = express();
const { Player } = require("discord-player"); // Create a new Player (Youtube API key is your Youtube Data v3 key)

const API_KEY = process.env.API_KEY;

const player = new Player(client, {
    useAPI: !!API_KEY,
    apiKEYs: [API_KEY],
    leaveOnEnd: false,
    leaveOnStop: false,
    leaveOnEmpty: false
}); //To easily access the player

client.dc = Discord;
client.db = db; // todo: deprecate quick.db and use better-storing
client.player = player;
client.player.loop = false;
client.commands = new Discord.Collection();
client.aliases =  new Discord.Collection();

//client.colors = require('./config.json')
client.lang = require('./lang.json')
//client.emotes = require('./emoji.json')

client.embed = new Discord.MessageEmbed();
client.time = (ms) => { // todo: redirect to LocalTools
  let hour = Math.floor(ms / 3600)
  let min = Math.floor((ms % 3600) / 60)
  let sec = (ms % 3600) % 60 
  if (hour == 0) {
    if (min.toString().length == 1) min = "0" + min
    if (sec.toString().length == 1 && sec != 0) sec = "0" + sec
    return min + ":" + sec;
  } else {
    if (min.toString().length == 1) min = "0" + min
    if (sec.toString().length == 1 && sec != 0) sec = "0" + sec
    return hour + ":" + min + ":" + sec;
  }
}

fs.readdir("./commands/", (err, files) => {
    //it will filter all the files in commands directory with extension .js
    let jsfile = files.filter(f => f.split(".").pop() === "js")
    //this will be executed if there is no files in command folder with extention .js
    if(jsfile.length <= 0) return console.log("Could not find any commands!");
    //it's similar to for loop
    jsfile.forEach((f, i) => { 
     //it will log all the file names with extension .js
    console.log(`Loaded ${f}!`);
        
    let pull = require(`./commands/${f}`);
   
    client.commands.set(pull.config.name, pull);  
    pull.config.aliases.forEach(alias => {
    client.aliases.set(alias, pull.config.name)
                
    });
})});
client.on("ready", () => {
  console.log(client.user.tag + 'is gay')
})
client.on('messageCreate', async message => {
    if (!message.member) return;
    
    let prefix = db.get(`prefix_${message.guild.id}`) || "r!"
    let lang = db.get(`lang_${message.author.id}`) || "default"

    client.prefix = prefix;
    client.ulang = lang;

    client.lc = client.lang[client.ulang]; // Language Code

    message.member.isDJ = () => {
      return message.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_CHANNELS) || message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR) || message.member.voice.channel?.members?.filter(m => !m.user.bot)?.size === 1;
    }; // todo: implement DJ/Admin role system

    let messageArray = message.content.split(" ")
    let cmd = messageArray[0].toLowerCase();
    let args = messageArray.slice(1);
      
    if (message.mentions.users.first() == client.user) return message.channel.send("**My prefix here is** ``"+prefix+"``")
    if(!message.content.startsWith(prefix)) return;
    let commandfile = client.commands.get(cmd.slice(prefix.length)) || client.commands.get(client.aliases.get(cmd.slice(prefix.length)))
    if(commandfile) commandfile.run(client,message,args,prefix);   
});

var Long = require("long")
const getDefaultChannel = (guild) => {
  if(guild.channels.has(guild.id))
    return guild.channels.get(guild.id)

  const generalChannel = guild.channels.cache.find(channel => channel.name === "general");
  if (generalChannel)
    return generalChannel;

  return guild.channels.cache
   .filter(c => c.type === "text" &&
     c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
   .sort((a, b) => a.position - b.position ||
     Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
   .first();
}

client.on('guildCreate', guild => {
  try {
    getDefaultChannel(guild).send(`**Thank you for adding me!** :white_check_mark: 
``-`` My prefix here is !
``-`` You can see a list of commands by typing !help
``-`` You can change my prefix with !settings prefix
``-`` If you need help, feel free to join our support server at **https://rythmbot.co/support**
**By having Rythm in your server and using Rythm, you agree to the following Terms of Service: https://rythmbot.co/tos**`)
    //client.users.cache.find(m => m.id === "599923291968241666").send("I am in " + guild.name + ", Now!")
  } catch (e) {
    //client.users.cache.find(m => m.id === "599923291968241666").send("error when in " + guild.name)
  }
})

client.login(process.env.TOKEN);
