const { Row, Button, Embed, Menu } = require("../../../../../src/structure/backend/build");
module.exports.run = function (client, interaction) {
    client.db.query(`SELECT * FROM logchannels WHERE guild = ?;`, [interaction.guild.id], function (err, res) {
        if (!res?.length) {
            let components = [
                new Row().addComponent(
                    new Button()
                        .setLabel("Get started")
                        .setStyle(1)
                        .setCustomId(`dutylogsetup`)
                )
            ];
            return interaction.reply({ content: "It looks like you haven't setup a patrol yet! Click the button below to get started.", components: components, ephemeral: true });
        } else {
            let emojis = {
                no: "<:cross:1108279767159033896>",
                yes: "<:check:1108279753238130728>"
            };
            let embed = new Embed()
                .setAuthor({ name: "Modify Duty Logging Channels" })
                .setColor(client.config.color)
                .setFooter({ text: "Developed by: jordan2139" })
                .setDescription(`**Type**: ${client.config.departments[res[0].type].name}\n**Channel**: <#${res[0].channelid}>`)
            let components = [
                new Row().addComponent(
                    new Button()
                        .setLabel("Change type")
                        .setStyle(1)
                        .setCustomId(`dutylogs-type-${res[0].id}`)
                ).addComponent(
                    new Button()
                        .setLabel("Delete channel")
                        .setStyle(4)
                        .setCustomId(`dutylogs-delete-${res[0].id}`)
                ),
                new Row().addComponent(
                    new Menu()
                        .setPlaceholder("Select a channel...")
                        .setType(8)
                        .setChannelTypes(0, 5)
                        .setMax(1)
                        .setCustomId(`dutylogs-channel-${res[0].id}`)
                )
            ];
            interaction.reply({ embeds: [embed], components: components, ephemeral: true });
        };
    });
};

module.exports.info = {
    perm: "ManageGuild"
};