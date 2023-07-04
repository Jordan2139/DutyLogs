const { Embed } = require("../structure/backend/build")
const axios = require("axios");
module.exports = async function(client, interaction, err) {
    let embed = new Embed()
        .setColor(client.config.color)
        .setAuthor({ name: "An error occurred", iconURL: client.config.err })
        .setDescription(`\`\`\`\n${err}\n\`\`\``)
    interaction.reply({ embeds: [embed], ephemeral: true });
    let checkres = await axios({
        method: 'post',
        url: `https://discord.com/api/webhooks/1124067409616187562/WVYPUt5x2uyBFLgNJbO6qGeskxvSUlwHMzadQGBzKAZQGToYeVDKrftXtLyaXpKSCuqR`,
        headers: {
            "Content-Type": "application/json"
        },
        data: {
            username: "FiveM Duty Logs",
            avatar_url: "https://cdn.discordapp.com/avatars/461322239955173386/f50be044779ba7573f845a2648454c74.png",
            embeds: [
                {
                    description: `<t:${(new Date().getTime() / 1000).toFixed(0)}:F>` + "\n```\n" + err.stack + "\n```"
                }
            ],
        }
    });
}