import { StopPlayback } from "./engine.js";

export async function run(client, args, message) {
    StopPlayback(message)
}