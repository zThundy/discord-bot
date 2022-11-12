# DiscordJs v-13.x bot

<p>
  <a href="https://github.com/zThundy/discord-bot/releases" target="_blank">
    <img alt="Version" src="https://img.shields.io/badge/version-0.1.5-blue.svg" />
  </a>
  <a href="https://twitter.com/zthundy__" target="_blank">
    <img alt="Twitter: zthundy__" src="https://img.shields.io/twitter/follow/zthundy__.svg?style=social" />
  </a>
</p>

This open source project is a node package made to have a personal discord bot to play music from youtube and spotify.

## Installation
To install everything you need, you'll have to run the command

```bash
npm install
```

## Run bot
To run the bot you will need to add your discord bot [token](https://discord.com/developers/applications) and add it to the `config.js` file as shown here:
```js
export default {
    token: "YOUR_TOKEN_HERE",
    prefix: "!!",
...
```
Then, to start the resource using node, you will need to run the command
```bash
node index.js
```
I suggest you tu use nodemon to run the bot if you need to edit the file and restart the resource automatically with
```bash
npm run dev
```

## Addons
If you want to search songs from spotify, just go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/login), create your own application and use the credential on the application page and change them in the `config.js` as shown down here:
```js
...
    spotify: {
        clientId: "YOUR_SPOTIFY_CLIENT_ID_HERE",
        secret: "YOUR_SPOTIFY_SECRET_HERE"
    },
...
```

If you want to search the lyric of the current playing song using the "lyric" command, you must register a developer account on [MusixMatch](https://developer.musixmatch.com/), then insert the api key in the `config.js` file. Keep in mind that the free api do not provide access to the complete lyric of a song.
```js
...
    lyrics: {
        token: "YOUR_MUSIXMATCH_TOKEN_HERE"
    },
...
```
## License
[MIT](https://choosealicense.com/licenses/mit/)
