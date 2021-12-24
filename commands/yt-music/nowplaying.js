import { MessageEmbed } from "discord.js";
import { FormatNumber } from "./../../classes/utils.js";

export function getCommandInfo() {
    return {
        command: "nowplaying",
        description: "If a song is playing, will show the song general informations 📜",
    }
}

export async function run(client, args, message) {
    let a = client.player.nowplaying();
    const song = a[0];
    const looping = a[1];

    // check if something is playing
    if (!song) {
        let embed = new MessageEmbed()
            .setDescription("No song playing rn 😔")
            .setColor("#FF0000");
        message.channel.send({ embed });
        return;
    }

    // check if the song has been fetched from spotify, if yes
    // use the spotify informations insted of youtube ones
    if (song.spotifyInfo) {
        song.title = song.spotifyInfo.name;
        if (song.spotifyInfo.album.name) song.albumName = song.spotifyInfo.album.name;
        if (song.spotifyInfo.artists && song.spotifyInfo.artists[0]) song.author.name = song.spotifyInfo.artists[0].name;
    }

    let embed = new MessageEmbed()
        .setTitle("Current song playing 🤩")
        .addFields([
            {
                name: "Title",
                value: song.title,
                inline: true
            },
            {
                name: "Author",
                value: song.author.name,
                inline: true 
            },
            {
                name: "Views",
                value: FormatNumber(song.viewCount),
                inline: true
            },
            {
                name: "Published",
                value: song.publishDate,
                inline: true
            },
            {
                name: "Age restricted",
                value: song.age_restricted ? "✅" : "❌",
                inline: true
            },
            {
                name: "Looping",
                value: looping ? "✅" : "❌",
                inline: true 
            }
        ])
        .setThumbnail(song.author.thumbnails[0].url)
        .setDescription("[Youtube Link](" + song.video_url + ")");
    message.channel.send({ embed });
}