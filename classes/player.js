import fs from "fs";
import ytdl from "ytdl-core";
import ytsr from "ytsr";
import config from "../config.js";
import Spotify from "./spotify.js";
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
        // check first if this is a link or not
        if (!link.includes("http")) return false;
        // check if the link is from spotify
        if (!(link.includes("spotify") || link.includes("open.spotify"))) return false;
        return true;
    }

    _isSpotifyPlaylist(link) {
        if (link.includes("playlist")) return true;
        return false;
    }

    _isYoutubeLink(link) {
        // check first if this is a link or not
        if (!link.includes("http")) return false;
        // check if the link is from youtube
        if ((!(link.includes("youtube") || link.includes("youtu")))) return false;
        return true;
    }

    _fetchInformations(args) {
        return new Promise(async (resolve, reject) => {
            try {
                let songInfo;
                if (this._isSpotifyLink(args[1])) {
                    let info;
                    var query = await spotify.getTrackByURL(args[1]);
                    if (query.artists) {
                        info = query;
                        query = query.name + " " + query.artists[0].name;
                    } else {
                        info = query;
                        query = query.name;
                    }
                    const searchResults = await ytsr(query, { limit: 1 });
                    if (searchResults && searchResults.items)
                        if (searchResults.items[0].url) {
                            songInfo = await ytdl.getBasicInfo(searchResults.items[0].url);
                            songInfo.spotify = info;
                        }
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
                if (songInfo.spotify) song.spotifyInfo = songInfo.spotify;
                log("Got informations for song: " + song.title);
                resolve(song);
            } catch(e) { reject(e); }
        });
    }

    _downloadFirst(song) {
        return new Promise((resolve, reject) => {
            const link = "./audios/" + song.videoId + ".mp3";
            try {
                if (!fs.existsSync(link)) {
                    log("Downloading from youtube " + song.title);
                    ytdl(song.video_url, { quality: "highestaudio", filter: "audioonly" })
                        .pipe(fs.createWriteStream(link))
                        .on("finish", () => {
                            log("Finished downloading from youtube " + song.title);
                            resolve(link);
                        });
                } else {
                    resolve(link);
                }
            } catch(e) { reject(e); }
        })
    }

    _start(args = false) {
        try {
            // if there's nothing playing
            if (!this.queue[this.message.guild.id].getNowplaying()) {
                // get volume to set right amount to dispatcher
                const volume = this.queue[this.message.guild.id].getValue("volume");
                var song = this.queue[this.message.guild.id].getFirst();
                // check if a song is passed as argument use it for everything
                if (args) song = args;
                // set nowplaying to current song
                this.queue[this.message.guild.id].setValue("nowplaying", song);
                const connection = this.queue[this.message.guild.id].getValue("connection");
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
                        // check if loop is true to start playback even if queue is empty
                        if (loop) song = looping;
                        this.queue[this.message.guild.id].setValue("nowplaying", false);
                        if (song) {
                            if (loop) {
                                this._start(song);
                            } else {
                                this._start();
                            }
                        } else {
                            this.stop();
                        }
                    })
                    .on("error", e => { console.error(e) })
                    .on("pause", () => { console.log("stream in pause") }) ;
                dispatcher.setVolume(volume);
                this.queue[this.message.guild.id].setValue("dispatcher", dispatcher);
                // check if there's a song looping to dequeue the first from the songs list
                const loop = this.queue[this.message.guild.id].getValue("loop");
                if (!loop) this.queue[this.message.guild.id].dequeue();
            }
        } catch(e) {
            log("Error on playing song: " + e);
        }
    }

    /**
     * Main function. Use this with arguments to start fetching and playing whatever song you want
     */
    async play(args) {
        return new Promise((resolve, reject) => {
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
                        resolve();
                        this._start();
                    })
                    .catch(e => {
                        let string;
                        switch(e) {
                            case "no-song-queued":
                                string = "No song currently queued";
                                break;
                            default:
                                string = "There has been an error. Please try again later\n\n`Trace: " + e + "`";
                        }
                        
                        log(string);
                        reject(e);
                    });
                }).catch(e => reject(e));
            }).catch(e => reject(e));
        })
    }

    skip() {
        // check if there's something playing
        if (this.queue[this.message.guild.id].getNowplaying()) {
            const dispatcher = this.queue[this.message.guild.id].getValue("dispatcher");
            dispatcher.end();
            return true;
        }
        return false;
    }

    loop() {
        // check if there's something playing
        const loop = this.queue[this.message.guild.id].getValue("loop");
        const nowplaying = this.queue[this.message.guild.id].getNowplaying();
        this.queue[this.message.guild.id].setValue("loop", !loop);
        return [loop, nowplaying];
    }

    stop() {
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

    nowplaying() {
        if (this.queue[this.message.guild.id].getNowplaying()) {
            return [this.queue[this.message.guild.id].getNowplaying(), this.queue[this.message.guild.id].getValue("loop")];
        }
        return [false, false];
    }

    getSongs() {
        return this.queue[this.message.guild.id].getValue("songs");
    }

    getVolume() {
        return this.queue[this.message.guild.id].getValue("volume");
    }

    setVolume(volume) {
        if (this.queue[this.message.guild.id].getNowplaying()) {
            this.queue[this.message.guild.id].setValue("volume", volume);
            const dispatcher = this.queue[this.message.guild.id].getValue("dispatcher");
            dispatcher.setVolume(volume);
        }
    }
}

export default Player;