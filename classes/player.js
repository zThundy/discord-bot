import fs from "fs";
import ytdl from "ytdl-core";
import ytsr from "ytsr";
import config from "../config.js";
import Spotify from "./spotify.js";
import { MessageEmbed } from "discord.js";
import { log } from "./utils.js";

const spotify = new Spotify(config.spotify);

class Queue {
    constructor(guild) {
        this.queue = {};
        this.queue.songs = [];
        this.queue.connection = null;
        this.queue.textChannel = null;
        this.queue.voiceChannel = null;
        this.queue.dispatcher = null;
        this.queue.loop = false;
        this.queue.nowplaying = false;
        this.queue.volume = config.musicPlayer.defaultVolume;

        this.id = guild;

        this._message
    }

    /**
     * 
     * @param {Message} message The discord message the song has been sent from.
     */
    _update(message) {
        this._message = message;
    }

    /**
     * 
     * @param {Player.song} song The song informations array passed by the Player class
     */
    enqueue(song) {
        return new Promise(async (resolve, reject) => {
            try {
                let voiceChannel = this._message.member.voice.channel;
                this.queue.songs.push(song);
                this.queue.connection = await voiceChannel.join();
                this.queue.textChannel = this._message.channel;
                this.queue.voiceChannel = voiceChannel;
                resolve();
            } catch(e) { reject(e) }
        });
    }

    dequeue() {
        this.queue.songs.shift();
    }

    setValue(index, value) {
        if (this.queue[index] !== undefined) this.queue[index] = value;
    }

    getValue(index) {
        if (this.queue[index] !== undefined) return this.queue[index];
    }

    getFirst() {
        if (this.queue.songs && this.queue.songs[0]) return this.queue.songs[0];
        return null;
    }

    getSongs() {
        return this.queue.songs;
    }

    getNowplaying() {
        return this.queue.nowplaying;
    }
}

class Player {
    /**
     * 
     * @param {Client} client The discord bot client instance.
     */
    constructor(client) {
        this.queue = {};
        client.guilds.cache.forEach(guild => {
            this.queue[guild.id] = new Queue(guild.id);
        });
    }

    /**
     * 
     * @param {Client} client The discord bot client instance.
     * @param {Message} message The discord message the song has been sent from.
     */
    update(client, message) {
        this.client = client;
        this.message = message;
        this.queue[this.message.guild.id]._update(this.message);
    }

    _isSpotifyLink(link) {
        if (link.indexOf("https") === -1 && !(link.includes("spotify") || link.includes("open.spotify"))) return false;
        return true;
    }

    _isSpotifyPlaylist(link) {
        if (link.includes("playlist")) return true;
        return false;
    }

    _isYoutubeLink(link) {
        if (link.indexOf("https") === -1 && (!(link.includes("youtube") || link.includes("youtu")))) return false;
        return true;
    }

    _fetchInformations(args) {
        return new Promise(async (resolve, reject) => {
            try {
                let songInfo;
                if (this._isSpotifyLink(args[1])) {
                    var query = await spotify.getTrackByURL(args[1]);
                    if (query.artists)
                        query = query.name + " " + query.artists[0].name;
                    else
                        query = query.name;
                    const searchResults = await ytsr(query, { limit: 1 });
                    if (searchResults && searchResults.items)
                        if (searchResults.items[0].url)
                            songInfo = await ytdl.getBasicInfo(searchResults.items[0].url);
                } else if (!this._isYoutubeLink(args[1])) {
                    var string = "";
                    args.shift();
                    for (var i in args) { string += args[i] + " "; }
                    const searchResults = await ytsr(string, { limit: 1 });
                    if (searchResults && searchResults.items)
                        if (searchResults.items[0].url)
                            songInfo = await ytdl.getBasicInfo(searchResults.items[0].url);
                } else {
                    songInfo = await ytdl.getBasicInfo(args[1]);
                }
                let song = songInfo.videoDetails;
                log("Got informations for song: " + song.title);
                resolve(song);
            } catch(e) { reject(e); }
        });
    }

    _downloadFirst(song) {
        return new Promise((resolve, reject) => {
            const link = "./audios/" + song.videoId + ".mp3";
            try {
                if (!fs.existsSync(link))
                    return ytdl(song.video_url, { quality: "highestaudio", filter: "audioonly" })
                        .pipe(fs.createWriteStream(link))
                        .on("finish", () => { resolve() });
                resolve(link)
            } catch(e) { reject(e); }
        })
    }

    _start(args = false) {
        try {
            // if there's nothing playing
            if (!this.queue[this.message.guild.id].getNowplaying()) {
                var song = this.queue[this.message.guild.id].getFirst();
                // set nowplaying to current song
                this.queue[this.message.guild.id].setValue("nowplaying", song);
                const connection = this.queue[this.message.guild.id].getValue("connection");
                if (args) song = args;
                log("Started playing " + song.local_link);
                const dispatcher = connection
                    .play(song.local_link)
                    .on("finish", () => {
                        // get always all the looping informations before the nowplaying is resetted
                        const loop = this.queue[this.message.guild.id].getValue("loop");
                        const looping = this.queue[this.message.guild.id].getValue("nowplaying");
                        // get the first song for the queue checks: if no song is in the first position,
                        // then stops the playback
                        song = this.queue[this.message.guild.id].getFirst();
                        this.queue[this.message.guild.id].setValue("nowplaying", false);
                        if (song) {
                            if (loop) {
                                this._start(looping);
                            } else {
                                this._start();
                            }
                        } else {
                            this.stop();
                        }
                    })
                    .on("error", e => { console.error(e) })
                    .on("pause", () => { console.log("stream in pause") })
                this.queue[this.message.guild.id].setValue("dispatcher", dispatcher);
                this.queue[this.message.guild.id].dequeue();
            }
        } catch(e) {
            log("Error on playing song: " + e);
        }
    }

    /**
     * Main function. Use this with arguments to start fetching and playing whatever song you want
     */
    async play(args) {
        // start downloading the first song of the queue
        this._fetchInformations(args)
        .then(song => {
            // download song found by the youtube search query
            this._downloadFirst(song)
            .then(local_link => {
                // save the local generated link
                song.local_link = local_link;
                // enqueue the song with all the informations
                this.queue[this.message.guild.id].enqueue(song)
                .then(() => {
                    this._start();
                })
                .catch(e => {
                    let string = "";
                    switch(e) {
                        case "no-song-queued":
                            string = "No song currently queued";
                            break;
                        default:
                            string = "There has been an error. Please try again later\n\n`Trace: " + e + "`";
                    }
                    
                    let embed = new MessageEmbed()
                        .setDescription(string)
                        .setColor("#FF0000");
                    this.message.channel.send({ embed });
                    log(string);
                });
            });
        })
        .catch(e => console.error(e));
    }

    skip() {
        // check if there's something playing
        if (this.queue[this.message.guild.id].getNowplaying()) {
            const dispatcher = this.queue[this.message.guild.id].getValue("dispatcher");
            dispatcher.end();
        }
    }

    loop() {
        // check if there's something playing
        if (this.queue[this.message.guild.id].getNowplaying()) {
            const loop = this.queue[this.message.guild.id].getValue("loop");
            this.queue[this.message.guild.id].setValue("loop", !loop);
            
            if (loop) {
                let embed = new MessageEmbed()
                    .setDescription("No more song loop")
                    .setColor("#FF0000");
                this.message.channel.send({ embed });
            } else {
                let embed = new MessageEmbed()
                    .setDescription("Looping current song")
                    .setColor("#FF0000");
                this.message.channel.send({ embed });
            }
        }
    }

    stop() {
        if (this.queue[this.message.guild.id].getNowplaying()) {
            this.queue[this.message.guild.id].setValue("songs", []);
            this.queue[this.message.guild.id].setValue("loop", false);
            this.queue[this.message.guild.id].setValue("nowplaying", false);
            const voiceChannel = this.queue[this.message.guild.id].getValue("voiceChannel");
            voiceChannel.leave();
            this.queue[this.message.guild.id].setValue("connection", null);
            this.queue[this.message.guild.id].setValue("dispatcher", null);
            this.queue[this.message.guild.id].setValue("textChannel", null);
            this.queue[this.message.guild.id].setValue("voiceChannel", null);
        }
    }

    nowplaying() {
        if (this.queue[this.message.guild.id].getNowplaying()) {
            return [this.queue[this.message.guild.id].getNowplaying(), this.queue[this.message.guild.id].getValue("loop")];
        }
        return [false, false];
    }

    getSongs() {
        return this.queue[this.message.guild.id].getValue("songs");
    }
}

export default Player;