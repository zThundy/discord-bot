export function getCommandInfo() {
    return {
        command: "stop",
        description: "Stop the current song stream and disconnects the bot ⏹",
    }
}

export async function run(client, args, message) {
    message.react("✅")
    .then(() => {
        client.player.stop();
    });
}