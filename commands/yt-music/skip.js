import { MessageEmbed } from "discord.js";
import config from "./../../config.js";

export function getCommandInfo() {
    return {
        command: "skip",
        description: "Skip the current song to the next in queue (if present) ⏩",
    }
}

export async function run(client, args, message) {
    message.react("✅")
    .then(() => {
        client.player.skip();
    });
}