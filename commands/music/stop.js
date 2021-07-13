import { MessageEmbed } from "discord.js";
import { StopPlayback } from "./engine.js";
import config from "./../../config.js";

let timeouts = {};

export async function run(client, args, message) {
    StopPlayback(message)
}

// export async function init(client) {
//     
// }