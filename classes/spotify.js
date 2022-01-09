// base class taken from https://github.com/thearkxd/spotify-info.js
import request from "request-promise";

class SpotifyClass {
    constructor(config) {
        if (!config.clientId)
            return console.error("You must specify a Spotify ID!");
        if (!config.secret)
            return console.error("You must specify a Spotify Secret!");
        this.authOptions = {
            url: "https://accounts.spotify.com/api/token",
            headers: { Authorization: `Basic ${this.fromBase64(config.clientId + ":" + config.secret)}` },
            form: { grant_type: "client_credentials" },
            json: true,
        };
    }

    fromBase64 (string) {
        return new Buffer.from(string).toString("base64");
    }

    async searchTrack(trackName, options = {}) {
        let APIOptions;
        await request.post(this.authOptions, async (error, response, body) => {
            if (error) return console.error(error);
            else if (response.statusCode === 429)
                return console.error("Too many requests!");
            else if (response.statusCode === 400)
                return console.error("Invalid arguments!");
            else if (options.limit && options.limit > 50)
                return console.error("The limit cannot be higher than 50!");
            var token = body.access_token;
            APIOptions = {
                url: `https://api.spotify.com/v1/search?q=${encodeURI(trackName)}&type=track&offset=0&limit=${options.limit || 1}`,
                headers: { Authorization: "Bearer " + token },
                json: true,
            };
        });
        let data = await request.get(APIOptions);
        return data.tracks.items;
    }

    async searchPlaylist(playListName, options = {}) {
        let APIOptions;
        await request.post(this.authOptions, async (error, response, body) => {
            if (error) return console.error(error);
            else if (response.statusCode === 429)
                return console.error("Too many requests!");
            else if (response.statusCode === 400)
                return console.error("Invalid arguments!");
            else if (options.limit && options.limit > 50)
                return console.error("The limit cannot be higher than 50!");
            var token = body.access_token;
            APIOptions = {
                url: `https://api.spotify.com/v1/search?q=${encodeURI(playListName)}&type=playlist&offset=0&limit=${options.limit || 1}`,
                headers: { Authorization: "Bearer " + token },
                json: true,
            };
        });
        let data = await request.get(APIOptions);
        return data.playlists.items;
    }

    async searchAlbum(albumName, options = {}) {
        let APIOptions;
        await request.post(this.authOptions, async (error, response, body) => {
            if (error) return console.error(error);
            else if (response.statusCode === 429)
                return console.error("Too many requests!");
            else if (response.statusCode === 400)
                return console.error("Invalid arguments!");
            else if (options.limit && options.limit > 50)
                return console.error("The limit cannot be higher than 50!");
            var token = body.access_token;
            APIOptions = {
                url: `https://api.spotify.com/v1/search?q=${encodeURI(albumName)}&type=album&offset=0&limit=${options.limit || 1}`,
                headers: { Authorization: "Bearer " + token },
                json: true,
            };
        });
        let data = await request.get(APIOptions);
        return data.albums.items;
    }

    async searchArtist(artistName, options = {}) {
        let APIOptions;
        await request.post(this.authOptions, async (error, response, body) => {
            if (error) return console.error(error);
            else if (response.statusCode === 429)
                return console.error("Too many requests!");
            else if (response.statusCode === 400)
                return console.error("Invalid arguments!");
            else if (options.limit && options.limit > 50)
                return console.error("The limit cannot be higher than 50!");
            var token = body.access_token;
            APIOptions = {
                url: `https://api.spotify.com/v1/search?q=${encodeURI(artistName)}&type=artist&offset=0&limit=${options.limit || 1}`,
                headers: { Authorization: "Bearer " + token },
                json: true,
            };
        });
        let data = await request.get(APIOptions);
        return data.artists.items;
    }

    async getTrack(trackID) {
        let APIOptions;
        await request.post(this.authOptions, async (error, response, body) => {
            if (error) return console.error(error);
            var token = body.access_token;
            APIOptions = {
                url: `https://api.spotify.com/v1/tracks/${trackID}`,
                headers: { Authorization: "Bearer " + token },
                json: true,
            };
        });
        return await request.get(APIOptions);
    }

    async getPlaylist(playListID) {
        let APIOptions;
        await request.post(this.authOptions, async (error, response, body) => {
            if (error) return console.error(error);
            var token = body.access_token;
            APIOptions = {
                url: `https://api.spotify.com/v1/playlists/${playListID}`,
                headers: { Authorization: "Bearer " + token },
                json: true,
            };
        });
        return await request.get(APIOptions);
    }

    async getAlbum(albumID) {
        let APIOptions;
        await request.post(this.authOptions, async (error, response, body) => {
            if (error) return console.error(error);
            var token = body.access_token;
            APIOptions = {
                url: `https://api.spotify.com/v1/albums/${albumID}`,
                headers: { Authorization: "Bearer " + token },
                json: true,
            };
        });
        return await request.get(APIOptions);
    }

    async getArtist(artistID) {
        let APIOptions;
        await request.post(this.authOptions, async (error, response, body) => {
            if (error) return console.error(error);
            var token = body.access_token;
            APIOptions = {
                url: `https://api.spotify.com/v1/artists/${artistID}`,
                headers: { Authorization: "Bearer " + token },
                json: true,
            };
        });
        return await request.get(APIOptions);
    }

    async getUser(userID) {
        let APIOptions;
        await request.post(this.authOptions, async (error, response, body) => {
            if (error) return console.error(error);
            var token = body.access_token;
            APIOptions = {
                url: `https://api.spotify.com/v1/users/${userID}`,
                headers: { Authorization: "Bearer " + token },
                json: true,
            };
        });
        return await request.get(APIOptions);
    }

    async getTrackByURL(trackURL) {
        let regex = /(?<=https:\/\/open\.spotify\.com\/track\/)([a-zA-Z0-9]{15,})/g;
        let trackID = trackURL.match(regex)[0];
        return await this.getTrack(trackID);
    }

    async getAlbumByURL(albumURL) {
        let regex = /(?<=https:\/\/open\.spotify\.com\/album\/)([a-zA-Z0-9]{15,})/g;
        let albumID = albumURL.match(regex)[0];
        return await this.getAlbum(albumID);
    }

    async getPlaylistByURL(playlistURL) {
        let regex = /(?<=https:\/\/open\.spotify\.com\/playlist\/)([a-zA-Z0-9]{15,})/g;
        let playListID = playlistURL.match(regex)[0];
        return await this.getPlaylist(playListID);
    }

    async getUserByURL(userURL) {
        let regex = /(?<=https:\/\/open\.spotify\.com\/user\/)([a-zA-Z0-9]{15,})/g;
        let userID = userURL.match(regex)[0];
        return await this.getUser(userID);
    }
}

export default SpotifyClass;