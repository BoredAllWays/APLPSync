const { SlashCommandBuilder } = require("discord.js");
const DocumentExtraction = require("../../utils/DocumentExtraction");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("raw")
        .setDescription("fetches the raw text from the last meeting minutes"),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const notes = await DocumentExtraction.getTabRecap(2);
            const responseText =
                notes.length > 2000 ? notes.substring(0, 1990) + "..." : notes;
            await interaction.editReply(responseText);
        } catch (error) {
            await interaction.editReply(
                `Failed to extract notes: ${error.message}`,
            );
        }
    },
};
