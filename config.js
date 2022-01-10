export default {
    prefix: "!!",

    // token | Discord dev application token, https://discord.com/developers/applications
    token: "YOUR_DISCORD_TOKEN_HERE",

    spotify: {
        // clientId | Client ID of your spotify application, https://developer.spotify.com/dashboard/applications
        clientId: "YOUR_SPOTIFY_ID_HERE",
        // secret | The secret key of your spotify application, https://developer.spotify.com/dashboard/applications
        secret: "YOUR_SPOTIFY_SECRET_HERE"
    },

    lyrics: {
        // token | Your musixmatch application token, https://developer.musixmatch.com/
        token: "YOUR_MUSIXMATCH_TOKEN_HERE"
    },

    musicPlayer: {
        // defaultVolume | from 0.01 to 1.00
        defaultVolume: 0.5,
        // queueMaxView | how many songs will be shown on the queue command response
        queueMaxView: 10,
        // quitEmptyChannel | if true, the bot will leave a channel if he is the only one inside. This will also clear the queue
        quitEmptyChannel: true
    },

    timeouts: {
        // timeBetweenCommands | The time need to pass between commands (if the user is not admin)
        timeBetweenCommands: 3
    },
    
    // a list of all the admins for the bot
    admins: ["YOUR_ADMIN_ID_HERE", "YOUR_OTHER_ADMIN_ID_HERE"]
}
