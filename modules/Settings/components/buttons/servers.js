const { Modal, Row, Text, Menu, Button, Embed } = require("../../../../src/structure/backend/build");

module.exports.run = function(client, interaction, data) {
    let modal;
    data = data.split("-");
    switch(data[0]) {
        case "create":
            modal = new Modal()
                .setTitle("Add server")
                .setCustomId(`servers-create`)
                .addComponent(new Row().addComponent(
                    new Text()
                        .setLabel("Hostname / IP")
                        .setPlaceholder("Hostname / IP here...")
                        .setStyle(1)
                        .setCustomId("ip")
                )).addComponent(new Row().addComponent(
                    new Text()
                        .setLabel("Port")
                        .setValues("30120")
                        .setStyle(1)
                        .setCustomId(`port`)
                )).addComponent(new Row().addComponent(
                    new Text()
                        .setLabel("Display Name")
                        .setPlaceholder("Defaults to server name from FiveM...")
                        .setStyle(1)
                        .setCustomId("name")
                        .setMax(256)
                        .setRequired(false)
                ));
            interaction.showModal(modal);
        break;
        case "name":
        case "ip":
        case "prefix":
            client.db.query(`SELECT * FROM servers WHERE id = ?;`, [Number(data[1])], function(err, res) {
                modal = new Modal()
                    .setTitle(data[0] == "name" ? "Change Name" : data[0] == "ip" ? "Change IP / Port" : data[0] == "prefix" ? "Change Voice Prefix" : "Error")
                    .setCustomId(`servers-edit-${data[1]}`)
                let text1;
                let text2;
                switch(data[0]) {
                    case "name":
                        text1 = new Text()
                            .setLabel("Server Display Name")
                            .setMax(256)
                            .setCustomId("name")
                            .setStyle(1)
                        res[0].name ? text1.setValues(res[0].name) : text1.setPlaceholder("Name here...")
                    break;
                    case "ip":
                        text1 = new Text()
                            .setLabel("Hostname / IP")
                            .setCustomId("ip")
                            .setStyle(1)
                        res[0].ip ? text1.setValues(res[0].ip) : text1.setPlaceholder("Hostname / IP...")
                        text2 =  new Text()
                            .setLabel("Port")
                            .setCustomId("port")
                            .setStyle(1)
                        res[0].port ? text2.setValues(res[0].port) : text2.setPlaceholder("Port...")
                    break;
                    case "prefix":
                        text1 =  new Text()
                            .setLabel("Voice Prefix Display")
                            .setCustomId("prefix")
                            .setStyle(1)
                        res[0].prefix ? text1.setValues(res[0].prefix) : text1.setPlaceholder("Prefix...")
                    break;
                };
                if (text1) modal.addComponent(new Row().addComponent(text1));
                if (text2) modal.addComponent(new Row().addComponent(text2));
                interaction.showModal(modal);
            });
        break;
        case "voice":
        case "text":
            interaction.update({ components: [
                new Row().addComponent(
                    new Menu()
                        .setCustomId(interaction.customId)
                        .setType(8)
                        .setChannelTypes(data[0] == "voice" ? 2 : 0)
                        .setMax(1)
                        .setPlaceholder("Select a channel...")
                ),
                new Row().addComponent(
                    new Button()
                        .setEmoji({ id: "1107207482021003294" })
                        .setStyle(4)
                        .setCustomId(`servers-cancel-${data[1]}`)
                )
            ] });
        break;
        case "cancel":
            interaction.update({ components: [
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
        break;
        case "back":
            client.db.query(`SELECT * FROM servers WHERE guild = ?;`, [interaction.guild.id], async function(err, servers) {
                let embed = new Embed()
                    .setAuthor({ name: "FiveM Servers" })
                    .setColor(client.config.color)
                let description = "";
                let menu;
                if (servers?.length) {
                    let data = [];
                    menu = new Menu()
                        .setPlaceholder("Select a server to edit...")
                        .setMax(1)
                        .setType(3)
                        .setCustomId(`servers-edit`)
                    for (let server of servers) {
                        let voice = interaction.guild.channels.cache.get(server.displayVoice);
                        let text = interaction.guild.channels.cache.get(server.displayText);
                        let name = server.name == null ? "N/A" : server.name.length <= 8 ? server.name : server.name.slice(0, 8) + "...";
                        data.push(
                            {
                                ID: server.id,
                                "Hostname / IP": server.ip,
                                Port: server.port,
                                Voice: voice?.name || "N/A",
                                Text: text?.name || "N/A",
                                Name: name
                            }
                        );
                        menu.addOption({
                            label: `${server.name.length <= 90 ? `ID: ${server.id} | ${server.name}` : `ID: ${server.id} | ${server.name.slice(0,87)}...`}`,
                            value: `${server.id}`
                        });
                    };
                    description = `\`\`\`ml\n${client.chart.create(data, { innerBorder: "⁞" })}\n\`\`\``;
                } else description = "No servers found.";
                embed.setDescription(description);
                let row = [
                    new Row().addComponent(
                        new Button()
                            .setCustomId(`servers-create`)
                            .setLabel("Add server")
                            .setStyle(3)
                    )
                ];
                if (menu) row.push(new Row().addComponent(menu));
                interaction.update({ embeds: [embed], components: row });
            });
        break;
        case "delete":
            client.db.query(`DELETE FROM servers WHERE id = ?;`, [Number(data[1])], function() {});
            client.db.query(`SELECT * FROM servers WHERE guild = ?;`, [interaction.guild.id], async function(err, servers) {
                servers = servers.filter(server => server.id !== Number(data[1]));
                let embed = new Embed()
                    .setAuthor({ name: "FiveM Servers" })
                    .setColor(client.config.color)
                let description = "";
                let menu;
                if (servers?.length) {
                    let data = [];
                    menu = new Menu()
                        .setPlaceholder("Select a server to edit...")
                        .setMax(1)
                        .setType(3)
                        .setCustomId(`servers-edit`)
                    for (let server of servers) {
                        let voice = interaction.guild.channels.cache.get(server.displayVoice);
                        let text = interaction.guild.channels.cache.get(server.displayText);
                        let name = server.name == null ? "N/A" : server.name.length <= 8 ? server.name : server.name.slice(0, 8) + "...";
                        data.push(
                            {
                                ID: server.id,
                                "Hostname / IP": server.ip,
                                Port: server.port,
                                Voice: voice?.name || "N/A",
                                Text: text?.name || "N/A",
                                Name: name
                            }
                        );
                        menu.addOption({
                            label: `${server.name.length <= 90 ? `ID: ${server.id} | ${server.name}` : `ID: ${server.id} | ${server.name.slice(0,87)}...`}`,
                            value: `${server.id}`
                        });
                    };
                    description = `\`\`\`ml\n${client.chart.create(data, { innerBorder: "⁞" })}\n\`\`\``;
                } else description = "No servers found.";
                embed.setDescription(description);
                let row = [
                    new Row().addComponent(
                        new Button()
                            .setCustomId(`servers-create`)
                            .setLabel("Add server")
                            .setStyle(3)
                    )
                ];
                if (menu) row.push(new Row().addComponent(menu));
                interaction.update({ embeds: [embed], components: row });
            });
        break;
    };
};