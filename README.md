# DiscordJs v-12.x bot

This open source project is a node package made to have a personal discord bot to play slots, display join and quit messages, play music from youtube and more.

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

## License
[MIT](https://choosealicense.com/licenses/mit/)
