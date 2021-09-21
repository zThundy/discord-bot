import { MessageEmbed } from "discord.js";
import { GetCurrentSong } from "./engine.js";
import { FormatNumber } from "./../../utils.js";

export async function run(client, args, message) {
    let song = await GetCurrentSong(message)

    // check if something is playing
    if (song.length == 0) {
        let embed = new MessageEmbed()
            .setDescription("No song playing rn 😔")
            .setColor("#FF0000")
        
        message.channel.send({ embed })
        return
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
            }
        ])
        .setThumbnail(song.author.thumbnails[0].url)

    message.channel.send({ embed })
}