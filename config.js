export default {
    token: "YOUR_DISCORD_TOKEN_HERE",
    prefix: "!!",
    spotify: {
        clientId: "YOUR_SPOTIFY_ID_HERE",
        secret: "YOUR_SPOTIFY_SECRET_HERE"
    },
    warn: {
        role1: {
            id: "800393386250076171",
            assignOn: 1
        },
        role2: {
            id: "800393411722477608",
            assignOn: 4
        },
        role3: {
            id: "800393437483630592",
            assignOn: 6
        },
        maxView: 5
    },
    musicPlayer: {
        defaultVolume: 0.5,
        timeBetweenCommands: 7, // in seconds
        queueMaxView: 5,
    },
    currency: {
        enableDefaultCurrency: true,
        defaultCurrency: 500,
        trisBonus: 20,
        emojis: {
            // emoji: percentuale di vittoria
            // showPerc multipli di 10 (compreso 0)
            "💵": {
                showPerc: 0,
                winningPerc: 10
            },
            "🍌": {
                showPerc: 10,
                winningPerc: 5
            },
            "🍉": {
                showPerc: 20,
                winningPerc: 4
            },
            "🍇": {
                showPerc: 30,
                winningPerc: 3.5
            },
            "🍓": {
                showPerc: 40,
                winningPerc: 3
            },
            "🍒": {
                showPerc: 50,
                winningPerc: 2.5
            },
            "🍏": {
                showPerc: 60,
                winningPerc: 2
            },
            "🥔": {
                showPerc: 70,
                winningPerc: 1.5
            },
            "🧄": {
                showPerc: 80,
                winningPerc: 1
            },
            "🧅": {
                showPerc: 90,
                winningPerc: 0.5
            },
            "🦴": {
                showPerc: 100,
                winningPerc: 0
            }
        }
    },
    admins: ["341296805646041100"],
    ticketRole: "800365783527063552",
    commands: [
        {
            command: "bet",
            description: "This command will start the slot machine minigame 🎰",
            args: [
                {
                    name: "daily",
                    description: "Adding this argument will check if the daily roll is ready or not"
                },
                {
                    name: "number",
                    description: "Adding this argument will start the minigame by removing the typed amount from your balance"
                },
                {
                    name: "setup",
                    description: "Adding this argument will setup the current channel as the minigame only channel",
                    onlyAdmins: true
                },
                {
                    name: "give",
                    description: "Adding this argument followed by 'me' or '@user' and a number will give the currency amount to the user",
                    onlyAdmins: true
                }
            ]
        },
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
        },
        {
            command: "ticket",
            description: "Setup a ticket system for your discord server 📚",
            args: [
                {
                    name: "create",
                    description: "Adding this argument the bot will register the current channel as the 'create ticket' channel",
                    onlyAdmins: true
                },
                {
                    name: "close",
                    description: "Adding this argument in the correct channel, will let the bot close the current ticket"
                }
            ]
        }
    ]
}
