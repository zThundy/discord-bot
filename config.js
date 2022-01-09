export default {
    prefix: "!!",

    // token | Discord dev application token, https://discord.com/developers/applications
    token: "ODA2OTI5Mzk0NjA1MDk3MDAx.YBwljw.v0ky7rzUZi3jMrgkf1_SHF3u4kM",

    spotify: {
        // clientId | Client ID of your spotify application, https://developer.spotify.com/dashboard/applications
        clientId: "4233862fa0ae473a88e1161ec3a0f2e5",
        // secret | The secret key of your spotify application, https://developer.spotify.com/dashboard/applications
        secret: "b03c74b0f93645b58e258cf10be27c94"
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
        // queueMaxView | how many songs will be shown on the queue command response
        queueMaxView: 10
    },

    timeouts: {
        // timeBetweenCommands | The time need to pass between commands (if the user is not admin)
        timeBetweenCommands: 3
    },
    
    // a list of all the admins for the bot
    admins: ["341296805646041100"]
}
