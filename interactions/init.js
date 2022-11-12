import { REST, Routes, Collection } from "discord.js";

import { GetCommands, GetCommand, UnregisterCommand, RegisterCommand } from "../commands/init.js";
import Colors from "../classes/colors.js";
const colors = new Colors();

class Interactions {
    constructor(client) {
        this.client = client;
        this.interactions = new Collection();
        this.REST = new REST({ version: '10' }).setToken(client.config.token);
        this.Routes = Routes;
        // this.client.on("interactionCreate", this.handleInteraction.bind(this));

        setTimeout(async () => {
            const commands = GetCommands();
            for (let i = 0; i < commands.length; i++) {
                const commandPath = "../commands/" + commands[i].path.replace("./", "");
                console.log(commandPath);
                const command = await import(commandPath);
                console.log(command);
                const info = command.getCommandInfo();
                this.register(command, info.command, info.description);
                console.log(colors.changeColor("green", "[Info] Interaction " + info.command + " loaded"));
            }
        }, 3000);
    }

    handleInteraction(interaction) {
        if (!interaction.isCommand()) return;
        const command = this.interactions.get(interaction.commandName);
        if (!command) return;
        command.execute(interaction);
    }

    async register(command, name, description) {
        this.interactions.set(name, command);
        await this.REST.put(
            this.Routes.applicationGuildCommands(this.client.user.id, this.client.config.guild),
            {
                body: {
                    name: name,
                    description: description,
                    options: [
                        {
                            name: "song",
                            description: "The song you want to play",
                            type: "STRING",
                            required: true
                        }
                    ]
                }
            },
        );
    }
}

export default Interactions;