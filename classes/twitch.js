// base class code taken from https://github.com/roydejong/timbot/blob/master/twitch-api.js
import request from "request-promise";

class TwitchApi {
    constructor(config) {
        this.clientId = config.clientId;
        this.secret = config.secret;
        this.channels = config.channelNames;
        this.uri = config.redirUri;

        // check if the passed token has the prefix oauth:
        // if it does we remove it
        const oauthPrefix = "oauth:";
        if (this.secret.startsWith(oauthPrefix)) this.secret = this.secret.substr(oauthPrefix.length);
        // setup the main apiOptions that we will use for making requests
        this.APIOptions = {
            url: "https://api.twitch.tv/helix/",
            headers: { "Client-ID": this.clientId, "Authorization": `Bearer ${this.secret}` },
            json: true
        }
    }

    // autenticate() {
    //     var authURL = "https://id.twitch.tv/oauth2/authorize";
    //     var clientId = `?client_id=${this.clientId}`;
    //     var redirUri = `&redirect_uri=${this.uri}`;
    //     var type = "&response_type=code";
    // }

    handleApiError(err) {
        const res = err.response || {};
        if (res.data && res.data.message) {
            console.error('[TwitchApi]', 'API request failed with Helix error:', res.data.message, `(${res.data.error}/${res.data.status})`);
        } else {
            console.error('[TwitchApi]', 'API request failed with error:', err.message || err);
        }
    }

    checkLive() {
        return new Promise((resolve, reject) => {
            var _APIOptions = this.APIOptions;
            _APIOptions.url += `streams?user_login=${this.channels.join('&user_login=')}`;
            console.log(_APIOptions)
            request.get(_APIOptions)
                .then(res => {
                    resolve(res.data.data || []);
                })
                .catch(err => {
                    this.handleApiError(err);
                    reject(err);
                });
        });
    }
}

export default TwitchApi;