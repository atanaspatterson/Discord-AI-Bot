// File to outlay what / commands in Discord are available to us
import dotenv from "dotenv"
import { REST, Routes, SlashCommandBuilder } from "discord.js"

// Define commands
const commands = [
    new SlashCommandBuilder()
        .setName('ama')
        .setDescription('Ask me anything!')
        .addStringOption(option => option.setName("question")
                                         .setDescription('Body Text')
                                         .setRequired(true)),
    new SlashCommandBuilder()
        .setName('genImg')
        .setDescription('Generate an image given a prompt!')
        .addStringOption(option => option.setName("text")
                                         .setDescription('Body Text')
                                         .setRequired(true)),
                                         
];

// Register commands
const rest = new REST().setToken(process.env.DISCORD_API_KEY);

(async () => {
    try {
        // Register commands here
        console.log('Registering slash commands...');

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID, 
                process.env.SERVER_ID
            ),
            { body: commands }
        );

        console.log('Slash commands registered successfully!');
    } catch (error) {
        // Error handling
        console.log(`There was an error: ${error}`);
    }
})();