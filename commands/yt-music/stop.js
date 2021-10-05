import { StopPlayback } from "./yt-engine.js";

export async function run(client, args, message) {
    StopPlayback(message)
}