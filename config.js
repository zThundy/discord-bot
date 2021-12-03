export default {
    token: "ODA2OTI5Mzk0NjA1MDk3MDAx.YBwljw.fPPMPIYEnhGDeLfLCBlLgPySrfQ",
    prefix: "!!",
    spotify: {
        clientId: "4233862fa0ae473a88e1161ec3a0f2e5",
        secret: "d3a4fdb1306947c6adba521ff3f2487f"
    },
    musicPlayer: {
        defaultVolume: 0.5,
        timeBetweenCommands: 3, // in seconds
        queueMaxView: 5,
    },
    admins: ["341296805646041100"],
    commands: [
        {
            command: "play",
            description: "Start a song stream in your voice channel via youtube search 🔊",
            args: [
                {
                    name: "youtube-link",
                    description: "Adding this argument the bot will join (if not already) to your channel and will start the song playback of the given youtube link"
                },
                {
                    name: "video title",
                    description: "Adding this argument the bot will join (if not already) to your channel and will start the playback of the first result of a youtube search"
                }
            ]
        },
        {
            command: "splay",
            description: "Start a song stream in your voice channel via spotify search 🔊",
            args: [
                {
                    name: "spotify-link",
                    description: "Adding this argument the bot will join (if not already) to your channel and will start the song playback of the given spotify link"
                },
                {
                    name: "spotify song title",
                    description: "Adding this argument the bot will join (if not already) to your channel and will start the playback of the first result of a spotify search"
                }
            ]
        },
        {
            command: "stop",
            description: "Stop the current song stream and disconnects the bot 🔇",
        },
        {
            command: "skip",
            description: "Skip the current song to the next in queue (if present) ⏩",
        },
        {
            command: "queue",
            description: "Show the list of queued songs in this server 🔠",
        },
        {
            command: "nowplaying",
            description: "If a song is playing, will show the song general informations 📜",
        }
    ]
}
