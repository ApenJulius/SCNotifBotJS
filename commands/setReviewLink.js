const { SlashCommandBuilder } = require("discord.js");
const { updateGoogleSheet, createSheetBody } = require("../components/functions/googleApi");
const { getCorrectTable } = require("../src/db");


module.exports = {
  data: new SlashCommandBuilder()
    .setName("setreviewlink")
    .setDescription("Set the reviewLink")
    .addStringOption((option) =>
      option
        .setName("reviewlink")
        .setDescription("Set the link to the review")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      let reviewLink = interaction.options.getString("reviewlink");
      if (
        !interaction.channel.name.startsWith("review-") &&
        !interaction.channel.name.startsWith("closed-")
      ) {
        await interaction.reply({
          content: "This command is only allowed in tickets",
          ephemeral: true,
        });
        return;
      }

      let submissionPos = interaction.channel.name
        .replace("closed-", "")
        .replace("review-", "");

      const r = await getCorrectTable(interaction.guildId, "reviewHistory").then(table => {
        return table.findOne({
          // Gets the correct table for server
          where: {
            id: submissionPos,
          }
        })
      })

      await r.update({
        reviewLink: reviewLink,
      });
      if(interaction.guildId == "294958471953252353") { // WoW id
        await updateGoogleSheet(createSheetBody(submissionPos, {reviewLink:reviewLink}))
      }
      await interaction.reply({ content: `Review Link set to ${reviewLink}` });
    } catch (err) {
      console.log(err);
      await interaction.reply({
        content: "Something went wrong when setting review link. Contact Staff",
        ephemeral: true,
      });
    }
  },
};
