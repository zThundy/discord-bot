import { LoopCurrentSong } from "./engine.js";

export async function run(client, args, message) {
    LoopCurrentSong(message)
}