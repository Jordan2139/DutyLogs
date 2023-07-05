const { Embed, Row, Button, Menu } = require("../../../../src/structure/backend/build")
module.exports.run = function (client, interaction, data) {
    let embed = new Embed()
        .setColor(client.config.color)
        .setAuthor({ name: "Duty Logs Setup" })
        .setFooter({ text: "Developed by: Jordan2139." })
    switch (data) {
        case "channel":
            let channel = interaction.guild.channels.cache.get(interaction.values[0]);
            if (!channel) return interaction.reply({ content: "Channel not found.", ephemeral: true });
            client.cache[interaction.member.id].channel = channel?.id;
            embed.setDescription(`**Type**: ${client.config.departments[client.cache[interaction.member.id].type].name}\n**Channel**: <#${client.cache[interaction.member.id].channel}>`)
            interaction.update({ embeds: [embed], components: interaction.message.components });
            break;
    };
};