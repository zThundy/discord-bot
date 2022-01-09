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
    },

    twitch: {
        // clientId | Client ID of your twitch application, https://dev.twitch.tv/console/apps
        clientId: "YOUR_CLIENT_ID_HERE",
        // secret | The secret key of your twitch application, https://dev.twitch.tv/console/apps
        secret: "YOUR_SECRET_HERE",
        // redirUri | The url you setup in your developer console, https://dev.twitch.tv/console/apps
        redirUri: "YOUR_REDIRECT_URI_HERE",
        // channelNames | include all the twitch channel names you want to check
        channelNames: ["CHANNEL_NAME_1", "CHANNEL_NAME_2", "CHANNEL_NAME_3"]
    },

    musicPlayer: {
        // defaultVolume | from 0.01 to 1.00
        defaultVolume: 0.5,
        queueMaxView: 10
    },

    timeouts: {
        // timeBetweenCommands | in seconds
        timeBetweenCommands: 3
    },
    
    admins: ["YOUR_ADMIN_ID_HERE", "YOUR_OTHER_ADMIN_ID_HERE"]
}
