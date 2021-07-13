import ytdl from "ytdl-core";
import config from "./../../config.js";
import { MessageEmbed } from "discord.js";

let queue = {};

export async function QueueSong(client, args, message, voiceChannel) {
    try {
        let songInfo = await ytdl.getBasicInfo(args[1])
        // console.log(songInfo)

        let song = songInfo.videoDetails

        if (!queue[message.guild.id].songs) queue[message.guild.id].songs = [];
        queue[message.guild.id].songs.push(song)

        queue[message.guild.id].connection = await voiceChannel.join()
        queue[message.guild.id].textChannel = message.channel
        queue[message.guild.id].voiceChannel = voiceChannel
        queue[message.guild.id].volume = config.musicPlayer.defaultVolume

        PlayFirstSong(message)
    } catch (e) {
        // console.error(e)
        // queue[message.guild.id].pop() 
        let embed = new MessageEmbed()
            .setDescription("No video found ☹️")
            .setColor("#FF0000")

        message.channel.send({ embed })
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

export async function PlayFirstSong(message) {
    let song = queue[message.guild.id].songs[0]

    if (!queue[message.guild.id].nowplaying) {
        queue[message.guild.id].nowplaying = song

        queue[message.guild.id].dispatcher = queue[message.guild.id].connection
            .play(ytdl(song.video_url, { quality: "highestaudio", filter: "audioonly" }))
            .on("finish", () => {
                queue[message.guild.id].songs.shift()
                queue[message.guild.id].nowplaying = false

                if (queue[message.guild.id].songs[0]) {
                    PlayFirstSong(message)
                } else {
                    queue[message.guild.id].voiceChannel.leave()

                    let embed = new MessageEmbed()
                        .setDescription(`I go bye bye 👋👋`)
                        .setColor("#FF0000")

                    queue[message.guild.id].textChannel.send({ embed })

                    queue[message.guild.id] = {};
                }
            })
            .on("error", e => {
                console.error(e)
            })
            .on("pause", () => {
                console.log("stream in pause")
            })

        let embed = new MessageEmbed()
            .setDescription(`Started playing **${song.title}** 😎`)
            .setColor("#00FF00")

        queue[message.guild.id].textChannel.send({ embed })
    } else {
        let embed = new MessageEmbed()
            .setDescription(`Song queued 🥳`)
            .setColor("#00FF00")

        queue[message.guild.id].textChannel.send({ embed })
    }
}

export async function init(client) {
    client.guilds.cache.forEach(guild => {
        console.log("Initialized queue for guildID " + guild.id)
        queue[guild.id] = {};
    })
}

export async function userJoinChannel(client, oldState, newState) {
    if (newState.member.user.bot && client.user.id == newState.member.user.id) {
        if (!newState.serverDeaf) {
            newState.setDeaf(true)
        }
    }
}

export async function StopPlayback(message) {
    if (queue[message.guild.id]) {
        if (queue[message.guild.id].voiceChannel) {
            let embed = new MessageEmbed()
                .setDescription("Ok. 😢")
                .setColor("#FF0000")

            message.channel.send({ embed })
            
            queue[message.guild.id].songs = [];
            queue[message.guild.id].dispatcher.end();
        } else {
            let embed = new MessageEmbed()
                .setDescription("I don't think i'm in your server right now 🤔")
                .setColor("#FF0000")

            message.channel.send({ embed })
        }
    }
}

export async function GetSongs(message) {
    if (queue[message.guild.id].songs) {
        return queue[message.guild.id].songs
    }

    return []
}

export async function GetCurrentSong(message) {
    if (queue[message.guild.id].nowplaying) {
        return queue[message.guild.id].nowplaying
    }

    return []
}