const { Embed, Row, Button } = require("../../../../src/structure/backend/build");
module.exports.run = function(client, interaction, data) {
    data = data.split("-");
    switch(data[0]) {
        case "edit":
            client.db.query(`SELECT * FROM servers WHERE id = ?;`, [Number(interaction.values[0])], function(err, res) {
                if (!res?.length) return interaction.reply({ content: "Unable to pull server data.", ephemeral: true });
                let voice = interaction.guild.channels.cache.get(res[0].displayVoice);
                let text = interaction.guild.channels.cache.get(res[0].displayText);
                let embed = new Embed()
                    .setAuthor({ name: "FiveM Servers" })
                    .setColor(client.config.color)
                    .setDescription(`> **${res[0].name}**\n**IP**: \`${res[0].ip}\`\n**Port**: \`${res[0].port}\`\n**Display Voice**: ${voice ? voice : "`N/A`"}\n**Display Text**: ${text ? text : "`N/A`"}\n**Voice Prefix**: ${res[0].prefix ? `\`${res[0].prefix}\`` : "`Players Online:`"}${res[0].inactive ? "\n**SERVER IS MARKED INACTIVE**" : ""}\n`)
                let row = [
                    new Row().addComponent(
                        new Button()
                            .setLabel("Change name")
                            .setCustomId(`servers-name-${res[0].id}`)
                            .setStyle(1)
                    ).addComponent(
                        new Button()
                            .setLabel("Change IP / port")
                            .setCustomId(`servers-ip-${res[0].id}`)
                            .setStyle(1)
                    ).addComponent(
                        new Button()
                            .setLabel("Change display voice")
                            .setCustomId(`servers-voice-${res[0].id}`)
                            .setStyle(1)
                    ).addComponent(
                        new Button()
                            .setLabel("Change display text")
                            .setCustomId(`servers-text-${res[0].id}`)
                            .setStyle(1)
                    ).addComponent(
                        new Button()
                            .setLabel("Change prefix")
                            .setCustomId(`servers-prefix-${res[0].id}`)
                            .setStyle(1)
                    ),
                    new Row().addComponent(
                        new Button()
                            .setLabel("Delete server")
                            .setStyle(4)
                            .setCustomId(`servers-delete-${res[0].id}`)
                    )
                ];
                interaction.update({ embeds: [embed], components: row });
            });
        break;
        case "voice":
        case "text":
            let channel = interaction.guild.channels.cache.get(interaction.values[0]);
            client.db.query(`SELECT * FROM servers WHERE id = ?;`, [Number(data[1])], function(err, res) {
                let server = res[0];
                let voice = interaction.guild.channels.cache.get(res[0].displayVoice);
                let text = interaction.guild.channels.cache.get(res[0].displayText);
                if (data[0] == "voice") voice = channel;
                if (data[0] == "text") text = channel;
                let embed = new Embed()
                    .setAuthor({ name: "FiveM Servers" })
                    .setColor(client.config.color)
                    .setDescription(`> **${server.name}**\n**IP**: \`${server.ip}\`\n**Port**: \`${server.port}\`\n**Display Voice**: ${voice ? voice : "`N/A`"}\n**Display Text**: ${text ? text : "`N/A`"}\n**Voice Prefix**: ${server.prefix ? `\`${server.prefix}\`` : "`Players Online:`"}${server.inactive ? "\n**SERVER IS MARKED INACTIVE**" : ""}\n`)
                client.db.query(`UPDATE servers SET displayVoice = ?, displayText = ? WHERE id = ?;`, [
                    voice ? voice.id : "",
                    text ? text.id : "",
                    server.id // clause
                ], function() {});
                interaction.update({ embeds: [embed], components: [
                    new Row().addComponent(
                        new Button()
                            .setLabel("Change name")
                            .setCustomId(`servers-name-${data[1]}`)
                            .setStyle(1)
                    ).addComponent(
                        new Button()
                            .setLabel("Change IP / port")
                            .setCustomId(`servers-ip-${data[1]}`)
                            .setStyle(1)
                    ).addComponent(
                        new Button()
                            .setLabel("Change display voice")
                            .setCustomId(`servers-voice-${data[1]}`)
                            .setStyle(1)
                    ).addComponent(
                        new Button()
                            .setLabel("Change display text")
                            .setCustomId(`servers-text-${data[1]}`)
                            .setStyle(1)
                    ).addComponent(
                        new Button()
                            .setLabel("Change prefix")
                            .setCustomId(`servers-prefix-${data[1]}`)
                            .setStyle(1)
                    ),
                    new Row().addComponent(
                        new Button()
                            .setEmoji({ id: "1107207482021003294" })
                            .setStyle(4)
                            .setCustomId("servers-back")
                    ).addComponent(
                        new Button()
                            .setLabel("Delete server")
                            .setStyle(4)
                            .setCustomId(`servers-delete-${data[1]}`)
                    )
                ] })
            });
        break;
    };
};