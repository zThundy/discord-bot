import Colors from "./colors.js";
import request from "request-promise";
import { log } from "./utils.js";
import { JSDOM } from "jsdom";
const colors = new Colors();

class Lyrics {
    constructor(config) {
        this.musixmatch = "https://www.musixmatch.com/lyrics/";
        this.link = `https://api.musixmatch.com/ws/1.1/`;
        this.key = config.token;
        this.apiRequest = { url: "", json: true };
    }


    _search(searchQuery) {
        return new Promise((resolve, reject) => {
            try {
                log("Lyrics get: " + searchQuery)
                request.get(searchQuery)
                    .then(searchResult => {
                        const dom = new JSDOM(searchResult);
                        const elements = dom.window.document.getElementsByClassName("mxm-lyrics__content");
                        var spans = [];
                        for (var i in elements) if (elements[i].tagName === "P") spans.push(elements[i].querySelector("span"));
                        var string = "";
                        for (var i in spans) if (spans[i]) string += spans[i].innerHTML + "\n";
                        if (typeof string !== "string") string = null;
                        resolve(string);
                    })
                    .catch(e => resolve(false));
            } catch(e) { reject(false); }
        });
    }

    async getTrackLyrics(song, artist, album) {
        return new Promise((resolve, reject) => {
            try {
                log("Attemting search of song: " + song + " by " + artist + " from the album " + album);
                const string = `${artist}/${song}`;
                this._search(`${this.musixmatch}${string}`)
                    .then(async res => {
                        if (!res) {
                            var link = await this.getTrackLyricUrl(song, artist, album);
                            if (!link) return resolve("Nothing found");
                            link = link.split("?")[0];
                            this._search(link)
                                .then(res => {
                                    if (!res) res = this._getTrackLyrics(song, artist, album);
                                    resolve(res);
                                })
                                .catch(e => reject(e));
                        } else {
                            resolve(res);
                        }
                    })
                    .catch(e => reject(e));
            } catch(e) { reject(e); }
        });
    }

    _errorHandling(code) {
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
            503: "Our system is a bit busy at the moment and your request can't be satisfied.",
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
        if (this._errorHandling(data.message.header.status_code)) return { track_id: false, code: data.message.header.status_code };
        return data.message.body.track;
    }

    async _getTrackLyrics(name, artist, album) {
        const track = await this.getTrackInfo(name, artist, album)
        if (!track.track_id) return this._errorHandling(track.code);
        const id = track.track_id;
        const commontrack_id = track.commontrack_id;
        let string = `track_id=${id}&commontrack_id=${commontrack_id}`;

        this.apiRequest.url = `https://api.musixmatch.com/ws/1.1/track.lyrics.get?apikey=${this.key}&${string}`;
        let data = await request.get(this.apiRequest);
        const error = this._errorHandling(data.message.header.status_code);
        if (error) return error;

        const lyrics = data.message.body.lyrics;
        lyrics.lyrics_body = lyrics.lyrics_body.split("...");
        lyrics.lyrics_body = lyrics.lyrics_body[0];
        // just randomly check if the string is longer than 100 because
        // if not, it's an error UwU
        if (lyrics.lyrics_body.length > 100) {
            var link = await this.getTrackLyricUrl(name, artist, album)
            link = link.split("?")[0];
            lyrics.lyrics_body += "\n\n**You can only view 30% of the lyric**";
            lyrics.lyrics_body += `\n**[MusixMatch Link](${link})**`;
        }

        return lyrics.lyrics_body;
    }

    async getTrackLyricUrl(name, artist, album) {
        log("Getting track's " + name + " by " + artist + " url using the musixmatch api")
        const track = await this.getTrackInfo(name, artist, album)
        return track.track_share_url;
    }
}

export default Lyrics;