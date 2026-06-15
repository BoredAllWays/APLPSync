const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

function makeHelpEmbed(commands) {
    const helpEmbed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("Available Commands")
        .setDescription("Here is a list of everything I can do:")
        .setTimestamp();

    for (const commandModule of commands.values()) {
        helpEmbed.addFields({
            name: `${commandModule.data.name}`,
            value: commandModule.data.description || "No description provided.",
            inline: false,
        });
    }

    return helpEmbed;
}

module.exports = {
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("List all available commands and their descriptions"),
    async execute(interaction) {
        const { commands } = interaction.client;
        const embed = makeHelpEmbed(commands);
        await interaction.reply({ embeds: [embed] });
    },
};
