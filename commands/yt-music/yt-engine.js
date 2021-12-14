import ytdl from "ytdl-core";
import ytsr from "ytsr";
import config from "../../config.js";
import { MessageEmbed } from "discord.js";
import fs from "fs";

let queue = {};

export async function QueueSong(client, args, message, voiceChannel, showMessage) {
    try {
        let songInfo;
        if (args[1].indexOf("http") === -1) {
            let string = "";
            args.shift();
            for (var i in args) { string += args[i] + " "; }
            if (showMessage) {
                let embed = new MessageEmbed()
                    .setDescription("Searching **" + string + "** 🧐")
                    .setColor("#FF0000");
                message.channel.send({ embed });
            }
            const searchResults = await ytsr(string, { limit: 1 });
            if (searchResults && searchResults.items)
                if (searchResults.items[0].url)
                    songInfo = await ytdl.getBasicInfo(searchResults.items[0].url);
        } else {
            if (!(args[1].includes("youtube") || args[1].includes("youtu"))) return console.error("Youtube link invalid");
            songInfo = await ytdl.getBasicInfo(args[1]);
        }
        let song = songInfo.videoDetails
        if (!queue[message.guild.id].songs) queue[message.guild.id].songs = [];
        queue[message.guild.id].songs.push(song);
        queue[message.guild.id].connection = await voiceChannel.join();
        queue[message.guild.id].textChannel = message.channel;
        queue[message.guild.id].voiceChannel = voiceChannel;
        queue[message.guild.id].loop = false;
        queue[message.guild.id].volume = config.musicPlayer.defaultVolume;

        FetchFirstSong(message, showMessage);
    } catch (e) {
        console.error(e);
        if (showMessage) {
            let embed = new MessageEmbed()
                .setDescription("No video found ☹️")
                .setColor("#FF0000");
            message.channel.send({ embed });
        }
    }
}

function PlayFirstSong(message, link, song, showMessage) {
    if (!queue[message.guild.id].nowplaying) {
        queue[message.guild.id].nowplaying = song
        queue[message.guild.id].dispatcher = queue[message.guild.id].connection
            .play(link)
            .on("finish", () => {
                if (!queue[message.guild.id].loop) {
                    queue[message.guild.id].songs.shift()
                    queue[message.guild.id].nowplaying = false
                    if (queue[message.guild.id].songs[0]) {
                        FetchFirstSong(message, showMessage)
                    } else {
                        queue[message.guild.id].voiceChannel.leave()
                        if (showMessage) {
                            let embed = new MessageEmbed()
                                .setDescription(`I go bye bye 👋👋`)
                                .setColor("#FF0000")
                            queue[message.guild.id].textChannel.send({ embed })
                        }
                        queue[message.guild.id] = {};
                    }
                } else {
                    queue[message.guild.id].nowplaying = false
                    FetchFirstSong(message, showMessage)
                }
            })
            .on("error", e => { console.error(e) })
            .on("pause", () => { console.log("stream in pause") })

        if (showMessage) {
            let embed = new MessageEmbed()
                .setDescription(`Started playing **${song.title}** 😎`)
                .setColor("#00FF00")
            queue[message.guild.id].textChannel.send({ embed })
        }
    } else {
        let last_song = queue[message.guild.id].songs[queue[message.guild.id].songs.lenght - 1];
        if (showMessage) {
            if (last_song) {
                let embed = new MessageEmbed()
                    .setDescription(`**${last_song.title}** queued 🥳`)
                    .setColor("#00FF00")
                queue[message.guild.id].textChannel.send({ embed })
            } else {
                let embed = new MessageEmbed()
                    .setDescription(`Song queued 🥳`)
                    .setColor("#00FF00")
                queue[message.guild.id].textChannel.send({ embed })
            }
        }
    }
}

export async function FetchFirstSong(message, showMessage) {
    if (queue[message.guild.id] && queue[message.guild.id].songs && queue[message.guild.id].songs[0]) {
        let song = queue[message.guild.id].songs[0];
        const link = "./audios/" + song.videoId + ".mp3";
        try {
            if (!fs.existsSync(link)) {
                ytdl(song.video_url, { quality: "highestaudio", filter: "audioonly" })
                    .pipe(fs.createWriteStream(link))
                    .on("finish", () => { PlayFirstSong(message, link, song, showMessage); });
            } else {
                PlayFirstSong(message, link, song, showMessage);
            }
        } catch(e) { console.log(e) }
    }
}

export async function LoopCurrentSong(message) {
    if (queue[message.guild.id] && queue[message.guild.id].nowplaying) {
        if (queue[message.guild.id].loop) {
            queue[message.guild.id].loop = false
            let embed = new MessageEmbed()
                .setDescription(`Stop looping of **${queue[message.guild.id].nowplaying.title}** 🎵`)
                .setColor("#FF0000")
            queue[message.guild.id].textChannel.send({ embed })
        } else {
            queue[message.guild.id].loop = true
            let embed = new MessageEmbed()
                .setDescription(`Now looping **${queue[message.guild.id].nowplaying.title}** 🎵`)
                .setColor("#00FF00")
            queue[message.guild.id].textChannel.send({ embed })
        }
    } else {
        let embed = new MessageEmbed()
            .setDescription(`Nothing is playing here right now ☹️`)
            .setColor("#FF0000")
        queue[message.guild.id].textChannel.send({ embed })
    }
}

export async function SkipCurrentSong(message) {
    if (queue[message.guild.id]) {
        if (queue[message.guild.id].songs && queue[message.guild.id].songs[1]) {
            queue[message.guild.id].dispatcher.end();
            let embed = new MessageEmbed()
                .setDescription("Skipping song for you 😁")
                .setColor("#00FF00")
            message.channel.send({ embed })
        } else {
            let embed = new MessageEmbed()
                .setDescription("No song queued 😢")
                .setColor("#FF0000")
            message.channel.send({ embed })
        }
    }
}

export async function StopPlayback(message) {
    if (queue[message.guild.id]) {
        if (queue[message.guild.id].voiceChannel) {
            let embed = new MessageEmbed()
                .setDescription("Ok. 😢")
                .setColor("#FF0000");
            message.channel.send({ embed });
            queue[message.guild.id].loop = false
            queue[message.guild.id].songs = [];
            queue[message.guild.id].dispatcher.end();
        } else {
            let embed = new MessageEmbed()
                .setDescription("I don't think i'm in your server right now 🤔")
                .setColor("#FF0000");
            message.channel.send({ embed });
        }
    }
}

export async function GetSongs(message) {
    if (queue[message.guild.id] && queue[message.guild.id].songs)
        return queue[message.guild.id].songs;
    return [];
}

export async function GetCurrentSong(message) {
    if (queue[message.guild.id] && queue[message.guild.id].nowplaying)
        return queue[message.guild.id].nowplaying;
    return [];
}

export async function IsCurrentSongLooping(message) {
    if (queue[message.guild.id] && queue[message.guild.id].nowplaying)
        return queue[message.guild.id].loop;
    return false;
}

export async function botJoinedGuild(guild) {
    console.log("Initialized new guild queue for guildID " + guild.id);
    queue[guild.id] = {};
}

export async function userJoinChannel(client, oldState, newState) {
    if (newState.member.user.bot && client.user.id == newState.member.user.id)
        if (!newState.serverDeaf) 
            newState.setDeaf(true);
}

export async function init(client) {
    client.guilds.cache.forEach(guild => {
        console.log("Initialized queue for guildID " + guild.id);
        queue[guild.id] = {};
    });
}