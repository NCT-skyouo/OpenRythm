const Discord = require('discord.js')
const { VoiceConnection, createAudioPlayer, AudioPlayerStatus, entersState, AudioResource, VoiceConnectionStatus, VoiceConnectionDisconnectReason } = require('@discordjs/voice')
const { EventEmitter } = require('events')
const { Stream } = require('stream')
const Track = require('./Track')

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Represents a guild queue.
 */
class Queue extends EventEmitter {
  /**
  * @param {Discord.Snowflake} guildID ID of the guild this queue is for.
  */
  constructor(guildID, connection) {
    super()
    /**
    * ID of the guild this queue is for.
    * @type {Discord.Snowflake}
    */
    this.guildID = guildID
    /**
    * The voice connection of this queue.
    * @type {VoiceConnection}
    */
    this.voiceConnection = connection
    /**
    * The song currently played.
    * @type {Track}
    */
    this.playing = null
    /**
    * The tracks of this queue. The first one is currenlty playing and the others are going to be played.
    * @type {Track[]}
    */
    this.tracks = []
    /**
    * Whether the stream is currently stopped.
    * @type {boolean}
    */
    this.stopped = false
    /**
    * Whether the last track was skipped.
    * @type {boolean}
    */
    this.lastSkipped = false
    /**
    * The stream volume of this queue. (0-100)
    * @type {number}
    */
    this.volume = 100
    /**
    * Whether the stream is currently paused.
    * @type {boolean}
    */
    this.paused = false
    /**
    * Whether the repeat mode is enabled.
    * @type {boolean}
    */
    this.repeatMode = false
    /**
    * Whether the queue loop mode is enabled.
    * @type {boolean}
    */
    this.queueLoopMode = false
    /**
    * Only use when queue loop mode is on.
    * @type {Track[]}
    */
    this.tracksCache = []
    /**
    * Filters status
    * @type {Filters}
    */
    this.filters = {}
    /**
    * Additional stream time
    * @type {Number}
    */
    this.additionalStreamTime = 0
    /**
    * Speed of the audio
    * @type {Number}
    */
    this.speed = 1
    /**
     * Pitch of the audio
     * @type {Number}
     * @since 2.3.4
     */
    this.pitch = 1
    /**
     * The previous song was played.
     * @type {Track[]}
     * @since 2.4.0
    */
    this.previousTrack = []
    /**
     * The members of voice channel.
     * @type {Stream?}
     * @since 3.0.0
     */
    this.stream = null;
    /**
     * Is the queue in party mode?
     * @type {boolean}
     * @since 3.1.0
     */
    this.party = false;
    /**
     * Is party mode's filter appied?
     * @type {boolean}
     * @since 3.2.0
     */
    this.partyFilterApplied = false;
    /**
     * Is the queue in autoplay mode?
     * @type {boolean}
     * @since 3.2.0
     */
    this.autoplay = false;
    /**
    * Is the queue in autoplay mode?
    * @type {?Discord.User[]}
    * @since 3.2.0
    */
    this.voter = [];

    this.queueLock = false

    this.readyLock = false

    this.audioPlayer = createAudioPlayer();

    /**
     * @type {AudioResource} 
     * @since 4.0.0
     */
    this.resource = null

    this.voiceConnection.subscribe(this.audioPlayer)

    this.voiceConnection.on('stateChange', async (_, newState) => {
      if (newState.status === VoiceConnectionStatus.Disconnected) {
        if (this.voiceConnection.rejoinAttempts < 5) {
          /*
              ?????????????????? 4014 ??????, ????????????????????????, ????????????????????????.
              The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
          */
          await wait((this.voiceConnection.rejoinAttempts + 1) * 5_000);
          this.voiceConnection.rejoin();
        } else {
          /*
              ?????????????????? 4014 ??????, ????????????????????????, ???????????????????????????, ???????????????.
              The disconnect in this case may be recoverable, but we have no more remaining attempts - destroy.
          */
          this.voiceConnection.destroy();
        }
      } else if (
        !this.readyLock &&
        (newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling)
      ) {
        /*
            ?????????????????????????????????????????????, ?????? 20 ???, ???????????????, ?????? 20 ????????????????????????, ???????????????.
            In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
            before destroying the voice connection. This stops the voice connection permanently existing in one of these
            states.
        */
        this.readyLock = true;
        try {
          await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, 20_000);
        } catch {
          if (this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) this.voiceConnection.destroy();
        } finally {
          this.readyLock = false;
        }
      }
    });

    // ?????????????????????
    // Configure audio player

    this.audioPlayer.on('error', console.error);
  }

  modify(k, v) {
    this[k] = v
  }

  async process(updateFilter, seek, encoderArgsFilters, player) {
    const seekTime = updateFilter ? parseInt((this.resource.playbackDuration + this.additionalStreamTime) * this.speed) : seek || undefined
    var encoderArgs = encoderArgsFilters.length ? ['-af', (encoderArgsFilters).join(',')] : [];
    if (updateFilter || (seek ?? false) !== false) {
      this.queueLock = true
      this.resource.playStream.destroy();
      this.resource.playStream.read();
      this.resource.volume.destroy();
      this.resource.volume.read();
      //queue.playing.stream.destroy();
      //queue.playing.stream.read();
      // this.audioPlayer.stop();
      const nextTrack = this.playing
      const resource = this.resource = await nextTrack.createAudioResource(seekTime, encoderArgs, player);
      // ????????????????????????, ?????????????????????????????????????????????.
      // If the conversion was successful, add the resource to the audio player.
      resource.volume.setVolumeLogarithmic(this.calculatedVolume / 200);
      this.audioPlayer.play(resource);
      if (seekTime) this.additionalStreamTime = seekTime
      this.queueLock = false;
      return entersState(this.audioPlayer, AudioPlayerStatus.Playing, 5e3);
    }
    // ???????????? Queue ???????????????/?????????/??????????????????????????????????????????, ???????????????
    // If the queue is locked (already being processed), is empty, or the audio player is already playing something, return
    if (this.queueLock || this.audioPlayer.state.status !== AudioPlayerStatus.Idle || !this.playing) {
      return;
    }
    // ????????????, ????????????????????????????????????
    // Lock the queue to guarantee safe access
    this.queueLock = true;

    // ??????????????????????????? Track, ???????????????????????????.
    // Take the first item from the queue. This is guaranteed to exist due to the non-empty check above.
    const nextTrack = this.playing

    var encoderArgs = encoderArgsFilters.length ? ['-af', (encoderArgsFilters).join(',')] : [];
    try {
      // ??? Track ??????????????? AudioResource (??????????????????)
      // Attempt to convert the Track into an AudioResource (i.e. start streaming the video)
      const resource = this.resource = await nextTrack.createAudioResource(seekTime, encoderArgs, player);
      // ????????????????????????, ?????????????????????????????????????????????.
      // If the conversion was successful, add the resource to the audio player.
      resource.volume.setVolumeLogarithmic(this.calculatedVolume / 200);
      this.audioPlayer.play(resource);
      if (seekTime) this.additionalStreamTime = seekTime
      this.queueLock = false;
      return entersState(this.audioPlayer, AudioPlayerStatus.Playing, 5e3);
    } catch (error) {
      console.log(error)
      // ????????????????????????, ??????????????????????????????
      // If an error occurred, try the next item of the queue instead
      this.emit('error', nextTrack, error);
      this.queueLock = false;
      return this.process();
    }
  }

  destroy() {
    this.additionalStreamTime = 0
    this.resource?.playStream?.destroy();
    this.resource?.playStream?.read();
    this.resource?.volume?.destroy();
    this.resource?.volume?.read();
    this.resource?.encoder?.destroy();
    this.resource?.encoder?.read();
  }

  get calculatedVolume() {
    return this.filters.bassboost ? this.volume + 50 : this.volume
  }
}

module.exports = Queue

/**
 * Emitted when the queue is empty.
 * @event Queue#end
 *
 * @example
 * client.on('message', (message) => {
 *
 *      const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
 *      const command = args.shift().toLowerCase();
 *
 *      if(command === 'play'){
 *
 *          let track = await client.player.play(message.member.voice.channel, args[0]);
 *
 *          track.queue.on('end', () => {
 *              message.channel.send('The queue is empty, please add new tracks!');
 *          });
 *
 *      }
 *
 * });
 */

/**
 * Emitted when the voice channel is empty.
 * @event Queue#channelEmpty
 */

/**
 * Emitted when the track changes.
 * @event Queue#trackChanged
 * @param {Track} oldTrack The old track (playing before)
 * @param {Track} newTrack The new track (currently playing)
 * @param {Boolean} skipped Whether the change is due to the skip() function
 *
 * @example
 * client.on('message', (message) => {
 *
 *      const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
 *      const command = args.shift().toLowerCase();
 *
 *      if(command === 'play'){
 *
 *          let track = await client.player.play(message.member.voice.channel, args[0]);
 *
 *          track.queue.on('trackChanged', (oldTrack, newTrack, skipped, repeatMode) => {
 *              if(repeatMode){
 *                  message.channel.send(`Playing ${newTrack} again...`);
 *              } else {
 *                  message.channel.send(`Now playing ${newTrack}...`);
 *              }
 *          });
 *
 *      }
 *
 * });
 */
