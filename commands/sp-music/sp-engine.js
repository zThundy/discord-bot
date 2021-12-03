import config from "../../config.js";
import Spotify from "../../spotify.js";
import { MessageEmbed } from "discord.js";
import { QueueSong } from "./../yt-music/yt-engine.js";

const spotify = new Spotify(config.spotify);
// let queue = {};

export async function SearchSongName(client, args, message, voiceChannel) {
    try {
        let songInfo = "";
        let tmp_args = [...args];
        if (tmp_args[1].indexOf("http") === -1) {
            let string;
            tmp_args.shift();
            for (var i in tmp_args) { string += tmp_args[i] + " "; }
            songInfo = await spotify.searchTrack(string);
            songInfo = songInfo[0];
        } else {
            if (!(args[1].includes("spotify") || args[1].includes("open.spotify"))) return console.error("Spotify link invalid");
            songInfo = await spotify.getTrackByURL(args[1]);
        }
        if (songInfo.artists)
            args = [args[0], songInfo.name, songInfo.artists[0].name];
        else
            args = [args[0], songInfo.name];
        QueueSong(client, args, message, voiceChannel);
    } catch (e) {
        console.error(e)
        let embed = new MessageEmbed()
            .setDescription("No song found on spotify ☹️")
            .setColor("#FF0000");
        message.channel.send({ embed });
    }
}