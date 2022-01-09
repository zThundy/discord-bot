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
        queueMaxView: 10
    },

    timeouts: {
        // timeBetweenCommands | in seconds
        timeBetweenCommands: 3
    },
    
    admins: ["YOUR_ADMIN_ID_HERE", "YOUR_OTHER_ADMIN_ID_HERE"]
}
