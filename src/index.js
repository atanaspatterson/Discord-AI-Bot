import OpenAI from "openai";
import dotenv from "dotenv";
import { Client, IntentsBitField, EmbedBuilder } from "discord.js";

// Initialize dot env so we can access env variables
dotenv.config();

// Flags that act as bitwise to select what from discord to access.
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
})


// Start running bot instance
client.login(process.env.DISCORD_API_KEY);

// Create OpenAI Object
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Logging when discord bot is online and ready
client.on('ready', (c) => {
    console.log(`${c.user.tag} is now running...`);
})

// Bot responds to hello messages
client.on('messageCreate', (message) => {
    /** Prevents bot from infinitely replying to itself */
    if (message.author.bot) {
        return;
    }

    console.log(`${message.author.username}: ${message.content}`);

    if (message.content.includes('hello')) {
        message.reply(`Hello ${message.author.username}!`);
    }
})

// Function for text generation with OpenAI API
async function generateMessage(textPrompt) {
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: 'You are a college student answering your classmate.',
            },
            {
                role: 'user',
                content: textPrompt,
            },
        ],
    });
    return response.choices[0].message;
}

// Function for image generation with OpenAI API
async function generateImage(imagePrompt) {
    const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: imagePrompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
    })
    console.log(response);
    return response.data[0].url;
}

// Handle slash commands
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.channel.id !== process.env.CHANNEL_ID) return;

    if (interaction.commandName === 'embed') {
        await interaction.deferReply();
        try {
            const prompt = interaction.options.get('text').value;
            const image = await generateImage(prompt);
            /** Chain methods to define shape of embed */
            const text = interaction.options.get('text').value;
            const embed = new EmbedBuilder().setTitle(`${interaction.user.username}`)
                                            .setDescription(`${prompt}`)
                                            .setImage(image)
                                            .setColor('Random');
            await interaction.editReply({ embeds: [embed] });
        } catch (e) {
            console.log("Error occurred: ", e);
            return await interaction.editReply('I\'m fresh out of images...');
        }
    }    

    if (interaction.commandName === 'ama') {
        /** Send typing status */
        await interaction.deferReply();
        const prompt = interaction.options.get('text').value;

        try {
            const response = await generateMessage(prompt);
            await interaction.editReply(response);
        } catch (e) {
            console.log("Error occurred: ", e);
            return await interaction.editReply('You\'ve stumped me D:');
        }
    }
})

/** client is our bot instance, so we can call our client, bot should be online now */
client.login(process.env.DISCORD_API_KEY);