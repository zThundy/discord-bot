import { LoopCurrentSong } from "./yt-engine.js";

export async function run(client, args, message) {
    LoopCurrentSong(message)
}