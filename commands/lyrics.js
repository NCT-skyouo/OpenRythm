const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const geniusLyricsAPI = process.env.GENIUS_LYRICS_API;

module.exports.run = async (bot, message, args) => {
  let playing = bot.player.isPlaying(message.guild.id)
  let songName = args.join(' ')
  if (!songName && playing) songName = await bot.player.nowPlaying(message.guild.id).name;
  if (songName == '' && !playing)
    return message.channel.send(
      bot.embed
        .setTitle(":x: **Missing args**")
        .setDescription(bot.prefix + "lyrics [Song Name]")
    );

  const sentMessage = await message.channel.send(
    ':mag: **Searching lyrics for** ``' + songName + "``"
  );

  // get song id
  var url = `https://api.genius.com/search?q=${encodeURI(songName)}`;

  const headers = {
    Authorization: `Bearer ${geniusLyricsAPI}`
  };
  try {
    var body = await fetch(url, { headers });
    var result = await body.json();
    const songID = result.response.hits[0].result.id;

    // get lyrics
    url = `https://api.genius.com/songs/${songID}`;
    body = await fetch(url, { headers });
    result = await body.json();

    const song = result.response.song;

    let lyrics = await getLyrics(song.url);
    lyrics = lyrics.replace(/(\[.+\])/g, '').replace(/<br>/g, '\n').replace(/\n\n/g, '\n').replace("EmbedShare URLCopyEmbedCopy", "");

    // Actually Rythm do not clear content on edit - 2019/08.

    if (lyrics.length > 4095) {
      lyrics = lyrics.match(/.{1,4096}/g).map(l => new MessageEmbed().setColor('GREEN').setDescription(l.trim()));
      lyrics[lyrics.length - 1].setFooter("Requested by " + message.author.tag, message.author.avatarURL());

      return sentMessage.edit({ content: null, embeds: [lyrics] });
    } else if (lyrics.length < 2048) {
      const lyricsEmbed = new MessageEmbed()
        .setColor('GREEN')
        .setDescription(lyrics.trim())
        .setFooter("Requested by " + message.author.tag, message.author.avatarURL());

      return sentMessage.edit({ content: null, embeds: [lyricsEmbed] });
    } else {
      // lyrics.length > 2048
      const firstLyricsEmbed = new MessageEmbed()
        .setColor('GREEN')
        .setDescription(lyrics.slice(0, 2048));
      const secondLyricsEmbed = new MessageEmbed()
        .setColor('GREEN')
        .setDescription(lyrics.slice(2048, lyrics.length))
        .setFooter("Requested by " + message.author.tag, message.author.avatarURL());

      sentMessage.edit({ content: null, embeds: [firstLyricsEmbed, secondLyricsEmbed] });
      return;
    }
  } catch (e) {
    return sentMessage.edit({
      content: ":x: Could not find lyrics for `" + args.join(" ") + "`"
      //new MessageEmbed()
      //.setColor("YELLOW")
      //.setDescription("No result")
      //.setFooter("Requested by " + message.author.username, message.author.displayAvatarURL())
    });
  }
  async function getLyrics(url) {
    const response = await fetch(url);
    const text = await response.text();
    const $ = cheerio.load(text);
    var lyrics = $('.lyrics')
      .text()
      .trim();

    if (!lyrics.length) lyrics = $('.Lyrics__Container-sc-1ynbvzw-8')
      .text()
      .trim();

    return lyrics.replace(/\*/g, '').replace(/~/g, '').replace(/_/g, '').replace(/<br>/g, '\n').replace(/\n\n/g, '\n');
  }
}
module.exports.config = {
  name: "lyrics",
  aliases: ['l', "ly"]
}