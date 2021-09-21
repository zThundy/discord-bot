import config from "../../config.js";
import Spotify from "../../spotify.js";
import { MessageEmbed } from "discord.js";
import { QueueSong } from "./../yt-music/engine.js";

const spotify = new Spotify(config.spotify);
// let queue = {};

export async function SearchSongName(client, args, message, voiceChannel) {
    try {
        let songInfo = null;
        let tmp_args = [...args];
        if (tmp_args[1].indexOf("http") === -1) {
            let string = ""
            tmp_args.shift()
            for (var i in tmp_args) { string += tmp_args[i] + " "; }
            songInfo = await spotify.searchTrack(string)[0];
        } else {
            // if (tmp_args[1].includes("track")) {
            //     console.log("searching single song")
            songInfo = await spotify.getTrackByURL(args[1]);
            // } else if (tmp_args[1].includes("playlist")) {
            //     let elements = await spotify.getPlaylistByURL(tmp_args[1]);
            //     elements.tracks.items.forEach(element => {
            //         if (!queue[message.guild.id]) queue[message.guild.id] = [];
            //         queue[message.guild.id].push({ name: element.name, artist: element.artists[0].name })
            //     });
            //     console.log(queue[message.guild.id])
            // }
        }
        if (songInfo.artists)
            args = [args[0], songInfo.name, songInfo.artists[0].name]
        else
            args = [args[0], songInfo.name]
        QueueSong(client, args, message, voiceChannel)
    } catch (e) {
        console.error(e)
        let embed = new MessageEmbed()
            .setDescription("No song found on spotify ☹️")
            .setColor("#FF0000")
        message.channel.send({ embed })
    }
}