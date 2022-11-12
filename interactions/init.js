import Discord from "discord.js";
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';

import { GetCommands, GetCommand, UnregisterCommand, RegisterCommand } from "../commands/init.js";
import Colors from "../classes/colors.js";
const colors = new Colors();

class Interactions {
    constructor(client) {
        this.client = client;
        this.interactions = new Discord.Collection();
        this.client.on("interactionCreate", this.handleInteraction.bind(this));

        setTimeout(async () => {
            const commands = GetCommands();
            for (let i = 0; i < commands.length; i++) {
                const commandPath = "../commands/" + commands[i].path.replace("./", "");
                const command = await import(commandPath);
                if (!command.getCommandInfo) continue;
                const info = command.getCommandInfo();
                this.register(command, info.command, info.description);
                console.log(colors.changeColor("green", "[Info] Interaction " + info.command + ".js loaded"));
            }
        }, 3000);
    }

    handleInteraction(interaction) {
        if (!interaction.isCommand()) return;
        const command = this.interactions.get(interaction.commandName);
        if (!command) return;
        const args = interaction.options._hoistedOptions;
        
        command.run(this.client, args ? args.map(arg => arg.value) : [], interaction);
    }

    async register(command, name, description) {
        const interaction = new SlashCommandBuilder()
            .setName(name)
            .setDescription(description);
        if (command.args) {
            for (let i = 0; i < command.args.length; i++) {
                const arg = command.args[i];
                if (arg.subcommand) {
                    const subcommand = new SlashCommandSubcommandBuilder()
                        .setName(arg.name)
                        .setDescription(arg.description);
                    if (arg.args) {
                        for (let j = 0; j < arg.args.length; j++) {
                            const subarg = arg.args[j];
                            subcommand.addStringOption(option => option.setName(subarg.name).setDescription(subarg.description).setRequired(subarg.required));
                        }
                    }
                    interaction.addSubcommand(subcommand);
                } else {
                    interaction.addStringOption(option => option.setName(arg.name).setDescription(arg.description).setRequired(true));
                }
            }
        }

        this.client.guilds.cache.forEach(async (guild) => {
            const commands = await guild.commands.fetch();
            const existingCommand = commands.find(cmd => cmd.name === name);
            if (existingCommand) {
                await existingCommand.delete();
            }
            await guild.commands.create(interaction);
        });

        this.interactions.set(name, command);
    }
}

export default Interactions;