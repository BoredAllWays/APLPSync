const { SlashCommandBuilder } = require("discord.js");
const GeminiGeneration = require("../../utils/GeminiGeneration.js");
const DocumentExtraction = require("../../utils/DocumentExtraction.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("recap")
        .setDescription(
            "Fetches a formatted recap of the text from the google docs using google gemini",
        ),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const notes = await DocumentExtraction.getTabRecap(2);
            const recap = await GeminiGeneration.generateRecap(notes);

            const responseText =
                recap.length > 2000 ? recap.substring(0, 1990) + "..." : recap;
            await interaction.editReply(responseText);
        } catch (error) {
            await interaction.editReply(
                `Failed to generate recap: ${error.message}`,
            );
        }
    },
};
