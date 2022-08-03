import fs from "fs";
import ytdl from "ytdl-core";
import ytsr from "ytsr";
import config from "../config.js";
import Spotify from "./spotify.js";
import { log } from "./utils.js";

const spotify = new Spotify(config.spotify);

/**
 * Custom queue class
 */

class Queue {
    constructor(guild) {
        this.queue = {};
        this.queue.songs = [];
        this.queue.connection = null;
        this.queue.currentMessage = null;
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
                this.queue.currentMessage = this._message;
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

/**
 * Custom song information caching class
 */

class Cache {
    constructor(client) {
        // init db shit
        // this._cache = {};
        // client.database.get("SELECT * FROM songs", {}, r => {
        //     for (var i in r)
        //         this._cache[r[i].id] = JSON.parse(r[i].data);
        // })

        this.linkPattern = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,'i'); // fragment locator
    }

    _updateQueryString(str) {
        if (this.linkPattern.test(str)) {
            var query = str.split("v=");
            // check full youtube link
            if (query[0] && query[1]) {
                query = query[1];
                let args = query.split("&");
                if (args[0] && args[1])
                    query = args[0];
                return query;
            }
            // check for short youtube link
            if (str.includes("youtu.be")) {
                var query = str.split(".be/");
                if (query[0] && query[1]) {
                    query = query[1];
                    let args = query.split("&");
                    if (args[0] && args[1])
                        query = args[0];
                    return query;
                }
            }
        }
        return str;
    }

    getInfoCache(query, client) {
        return new Promise((resolve, reject) => {
            try {
                query = query.toLowerCase();
                query = this._updateQueryString(query);
                log("Searching data in cache. Query: " + query);
                client.database.get("SELECT * FROM songs WHERE `id` LIKE ?", [query], r => {
                    if (r && r[0]) {
                        log("Found song data in database cache. Query: " + query);
                        resolve(JSON.parse(r[0].data));
                    } else {
                        log("No song data found in database cache. Query: " + query);
                        reject();
                    }
                });
            } catch(e) {
                reject(e);
            }
        });
    }

    saveInfoCache(query, data, extradata) {
        const guildId = extradata.guild;
        const client = extradata.client;
        this.getInfoCache(query, client)
            .then(() => {
                // this._cache[query] = data;
                log("Found data in cache for query " + query + " updating it anyway :P");
            })
            .catch(() => {
                if (data.embed) delete data.embed;
                if (data.availableCountries) delete data.availableCountries;
                if (data.description) delete data.description;
                if (data.keywords) delete data.keywords;
                if (data.chapters) delete data.chapters;
                if (data.storyboards) delete data.storyboards;
                if (data.thumbnails) delete data.thumbnails;
                // if a song given is a raw link, use it as the id in the db
                if (!data.spotifyInfo) query = data.video_url;
                if (query.includes("&")) query = query.split("&")[0];
                // this._cache[query] = data;
                query = query.toLowerCase();
                query = this._updateQueryString(query);
                log("Saving data in songs database cache for query " + query);
                client.database.execute("INSERT INTO songs(guild, id, data) VALUES(?, ?, ?)", [guildId, query, JSON.stringify(data)]);
            });
    }
}

/**
 * Custom audio player class
 */

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
        this.cache = new Cache(client);
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
        let regex = /(?<=https:\/\/open\.spotify\.com\/track\/)([a-zA-Z0-9]{15,})/g;
        if (regex.test(link)) return true;
        return false;
    }

    _isSpotifyPlaylist(link) {
        let regex = /(?<=https:\/\/open\.spotify\.com\/playlist\/)([a-zA-Z0-9]{15,})/g;
        if (regex.test(link)) return true;
        return false;
    }

    _isYoutubeLink(link) {
        // check first if the given string is even a link
        if (!this.cache.linkPattern.test(link)) return false;
        // check if the link is from youtube
        if ((!(link.includes("youtube") || link.includes("youtu")))) return false;
        return true;
    }

    _checkLink(link) {
        if (this._isSpotifyLink(link)) {
            return "spotify";
        } else if (this._isYoutubeLink(link)) {
            return "youtube";
        } else if (this._isSpotifyPlaylist(link)) {
            return "splaylist";
        }
        return "string";
    }

    _fetchInformations(args) {
        return new Promise(async (resolve, reject) => {
            try {
                let songInfo, query, spotifyInfo;
                let link = this._checkLink(args[1]);
                switch(link) {
                    case "spotify":
                        log("Searching song using spotify API. The query given is a link.");
                        query = await spotify.getTrackByURL(args[1]);
                        if (query.artists) {
                            spotifyInfo = query;
                            query = query.name + " " + query.artists[0].name;
                        } else {
                            spotifyInfo = query;
                            query = query.name;
                        }
                        break;
                    case "splaylist":
                        log("Searching song using spotify API. The query given is a playlist.");
                        query = await spotify.getPlaylistByURL(args[1]);
                        query = query.tracks.items;
                        query.type = link;
                        return resolve(query);
                    case "youtube":
                        log("Searching song using youtube API. The query given is a link.");
                        query = args[1];
                        break;
                    case "string":
                        log("Searching song using youtube API. The query given is a string.");
                        args.shift();
                        query = "";
                        for (var i in args) query += args[i] + " ";
                        let r = await spotify.searchTrack(query);
                        if (r && r[0]) r = r[0];
                        if (r.artists) {
                            spotifyInfo = r;
                            query = r.name + " " + r.artists[0].name;
                        } else {
                            spotifyInfo = r;
                            query = r.name;
                        }
                        break;
                }
                this.cache.getInfoCache(query, this.client)
                    .then(res => {
                        if (spotifyInfo) res.spotifyInfo = songInfo.spotify;
                        resolve(res);
                    })
                    .catch(async e => {
                        try {
                            if (!songInfo) {
                                const searchResults = await ytsr(query, { limit: 1 });
                                if (searchResults && searchResults.items) {
                                    if (searchResults.results == 0) return reject("No results have been found. Maybe this is not a song?");
                                    if (searchResults.items[0].url) {
                                        log("Getting extra informations from the youtube API.");
                                        songInfo = await ytdl.getBasicInfo(searchResults.items[0].url);
                                    }
                                }
                            }
                            let song = songInfo.videoDetails;
                            if (spotifyInfo) {
                                log("Searched query has spotify informations: adding it to song array");
                                song.spotifyInfo = spotifyInfo;
                            }
                            log("Got informations for song: " + song.title);
                            this.cache.saveInfoCache(query, song, { guild: this.message.guild.id, client: this.client });
                            resolve(song);
                        } catch(e) {
                            reject(e);
                        }
                    });
            } catch(e) { reject(e); }
        });
    }

    _downloadFirst(song) {
        return new Promise((resolve, reject) => {
            const link = "./cache/audios/" + song.videoId + ".mp3";
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
            this.queue[this.message.guild.id].setValue("loop", false);
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
        if (this.queue[this.message.guild.id].getNowplaying())
            return [this.queue[this.message.guild.id].getNowplaying(), this.queue[this.message.guild.id].getValue("loop")];
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