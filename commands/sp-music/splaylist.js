import { MessageEmbed } from "discord.js";
import { GetPlaylistSongs } from "./sp-engine.js";

export async function run(client, args, message) {
    GetPlaylistSongs(client, args, message);
}