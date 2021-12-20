export function getCommandInfo() {
    return {
        command: "loop",
        description: "Will start looping the current playling song 🔂"
    }
}

export async function run(client, args, message) {
    client.player.loop();
}