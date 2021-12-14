import Colors from "./colors.js";
import request from "request-promise";
const colors = new Colors();

class Lyrics {
    constructor(config) {
        this.link = `https://api.musixmatch.com/ws/1.1/`;
        this.key = config.token;
        this.apiRequest = { url: "", json: true };
    }

    errorHandling(code) {
        code = Number(code);
        const errors = {
            // 200: "The request was successful.",
            400: "The request had bad syntax or was inherently impossible to be satisfied.",
            401: "Authentication failed, probably because of invalid/missing API key.",
            402: "The usage limit has been reached, either you exceeded per day requests limits or your balance is insufficient.",
            403: "You are not authorized to perform this operation.",
            404: "The requested resource was not found.",
            405: "The requested method was not found.",
            500: "Ops. Something were wrong.",
            503: "Our system is a bit busy at the moment and your request can’t be satisfied.",
        }
        if (errors[code]) {
            console.log(colors.changeColor("red", "[LYRICS] Got error by musixmatch: " + errors[code]));
            return errors[code];
        }
        return false;
    }

    async getTrackInfo(name, artist, album) {
        if (!name) return console.log(colors.changeColor("red", "[LYRICS] You must include a song title"));
        let string = "q_track=" + name.replace(/ /g, "%20");
        if (artist) string += "&q_artist=" + artist.replace(/ /g, "%20");
        if (album) string += "&q_album=" + album.replace(/ /g, "%20");
        this.apiRequest.url = `https://api.musixmatch.com/ws/1.1/matcher.track.get?apikey=${this.key}&${string}`;
        
        let data = await request.get(this.apiRequest);
        if (this.errorHandling(data.message.header.status_code)) return { track_id: false, code: data.message.header.status_code };
        return data.message.body.track;
    }

    async getTrackLyrics(name, artist, album) {
        const track = await this.getTrackInfo(name, artist, album)
        if (!track.track_id) return { lyrics_body: this.errorHandling(track.code) };
        const id = track.track_id;
        const commontrack_id = track.commontrack_id;
        let string = `track_id=${id}&commontrack_id=${commontrack_id}`;

        this.apiRequest.url = `https://api.musixmatch.com/ws/1.1/track.lyrics.get?apikey=${this.key}&${string}`;
        let data = await request.get(this.apiRequest);
        const error = this.errorHandling(data.message.header.status_code);
        if (error) return error;
        return data.message.body.lyrics;
    }
}

export default Lyrics;