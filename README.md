# DiscordJs v-12.x bot

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

## Addon
If you want to search songs from spotify, just go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/login), create your own application and use the credential on the application page and change them in the `config.js` as shown down here:
```js
...
    spotify: {
        clientId: "YOUR_SPOTIFY_CLIENT_ID_HERE",
        secret: "YOUR_SPOTIFY_SECRET_HERE"
    },
...
```
## License
[MIT](https://choosealicense.com/licenses/mit/)
